import reducer, { fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

type TIngredientsState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: string | null;
};

const initialState: TIngredientsState = {
  ingredients: [],
  isLoading: false,
  error: null
};

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react-burger/images/bun-02.png',
    image_large:
      'https://code.s3.yandex.net/react-burger/images/bun-02-large.png',
    image_mobile:
      'https://code.s3.yandex.net/react-burger/images/bun-02-mobile.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Мясо бессмертных моллюсков Protostomia',
    type: 'main',
    proteins: 433,
    fat: 244,
    carbohydrates: 33,
    calories: 420,
    price: 1337,
    image: 'https://code.s3.yandex.net/react-burger/images/meat-04.png',
    image_large:
      'https://code.s3.yandex.net/react-burger/images/meat-04-large.png',
    image_mobile:
      'https://code.s3.yandex.net/react-burger/images/meat-04-mobile.png'
  }
];

describe('ingredientsSlice reducer', () => {
  it('должен вернуть начальное состояние при неизвестном экшене', () => {
    const result = reducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(result).toEqual(initialState);
  });

  describe('fetchIngredients.pending', () => {
    it('должен установить isLoading=true и сбросить ошибку', () => {
      const action = { type: fetchIngredients.pending.type };
      const result = reducer(initialState, action);

      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('fetchIngredients.fulfilled', () => {
    it('должен сохранить ингредиенты и сбросить isLoading', () => {
      const action = {
        type: fetchIngredients.fulfilled.type,
        payload: mockIngredients
      };
      const result = reducer({ ...initialState, isLoading: true }, action);

      expect(result.isLoading).toBe(false);
      expect(result.ingredients).toEqual(mockIngredients);
      expect(result.ingredients).toHaveLength(2);
    });
  });

  describe('fetchIngredients.rejected', () => {
    it('должен установить ошибку из action.error.message', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        error: { message: 'Network Error' }
      };
      const result = reducer({ ...initialState, isLoading: true }, action);

      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Network Error');
    });

    it('должен использовать дефолтное сообщение если message отсутствует', () => {
      const action = {
        type: fetchIngredients.rejected.type,
        error: {}
      };
      const result = reducer({ ...initialState, isLoading: true }, action);

      expect(result.error).toBe('Ошибка загрузки ингредиентов');
    });
  });
});
