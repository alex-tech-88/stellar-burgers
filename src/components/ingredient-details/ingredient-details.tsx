import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { IngredientDetailsUI } from '../ui/ingredient-details';
import { useAppSelector } from '../../services/hooks';
import { selectIngredients } from '../../services/slices/ingredientsSlice';

export const IngredientDetails: FC = () => {
  const { id } = useParams<{ id: string }>();
  const ingredients = useAppSelector(selectIngredients);
  const ingredientData = ingredients.find((item) => item._id === id) ?? null;

  if (!ingredientData) return <Preloader />;

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
