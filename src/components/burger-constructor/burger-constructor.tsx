import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import {
  selectConstructorItems,
  clearConstructor
} from '../../services/slices/constructorSlice';
import {
  createOrder,
  clearOrderModal,
  selectOrderRequest,
  selectOrderModalData
} from '../../services/slices/orderSlice';

export const BurgerConstructor: FC = () => {
  const dispatch = useAppDispatch();
  const constructorItems = useAppSelector(selectConstructorItems);
  const orderRequest = useAppSelector(selectOrderRequest);
  const orderModalData = useAppSelector(selectOrderModalData);

  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;

    const ids = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((i) => i._id),
      constructorItems.bun._id
    ];

    dispatch(createOrder(ids));
  };

  const closeOrderModal = () => {
    dispatch(clearOrderModal());
    dispatch(clearConstructor());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
