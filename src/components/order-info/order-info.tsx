import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import { selectIngredients } from '../../services/slices/ingredientsSlice';
import { selectOrders } from '../../services/slices/feedSlice';
import { selectProfileOrders } from '../../services/slices/profileOrdersSlice';
import {
  fetchOrderByNumber,
  selectCurrentOrder
} from '../../services/slices/orderSlice';

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector(selectIngredients);
  const feedOrders = useAppSelector(selectOrders);
  const profileOrders = useAppSelector(selectProfileOrders);
  const currentOrder = useAppSelector(selectCurrentOrder);

  const orderData = useMemo(
    () =>
      [...feedOrders, ...profileOrders].find(
        (o) => o.number === Number(number)
      ) ?? currentOrder,
    [feedOrders, profileOrders, currentOrder, number]
  );

  useEffect(() => {
    if (!number) return;
    const found = [...feedOrders, ...profileOrders].find(
      (o) => o.number === Number(number)
    );
    if (!found) {
      dispatch(fetchOrderByNumber(Number(number)));
    }
  }, [number]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item: string) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = { ...ingredient, count: 1 };
          }
        } else {
          acc[item].count++;
        }
        return acc;
      },
      {}
    );

    const total = Object.values<TIngredient & { count: number }>(
      ingredientsInfo
    ).reduce((acc: number, item) => acc + item.price * item.count, 0);

    return { ...orderData, ingredientsInfo, date, total };
  }, [orderData, ingredients]);

  if (!orderInfo) return <Preloader />;

  return <OrderInfoUI orderInfo={orderInfo} />;
};
