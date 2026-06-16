import reducer, {
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../constructorSlice';
import { createOrder } from '../orderSlice';
import { TIngredient, TConstructorIngredient } from '@utils-types';

type TConstructorState = {
  bun: TConstructorIngredient | null;
  ingredients: TConstructorIngredient[];
};

const initialState: TConstructorState = {
  bun: null,
  ingredients: []
};

const mockBun: TIngredient = {
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
};

const mockIngredient: TIngredient = {
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
};

const mockSauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://code.s3.yandex.net/react-burger/images/sauce-02.png',
  image_large:
    'https://code.s3.yandex.net/react-burger/images/sauce-02-large.png',
  image_mobile:
    'https://code.s3.yandex.net/react-burger/images/sauce-02-mobile.png'
};

describe('constructorSlice reducer', () => {
  it('должен вернуть начальное состояние при неизвестном экшене', () => {
    const result = reducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(result).toEqual(initialState);
  });

  // ─── addIngredient ────────────────────────────────────────────────────────

  describe('addIngredient', () => {
    it('должен добавить булку в поле bun', () => {
      const result = reducer(initialState, addIngredient(mockBun));
      expect(result.bun).not.toBeNull();
      expect(result.bun?._id).toBe(mockBun._id);
      expect(result.bun?.type).toBe('bun');
    });

    it('должен заменить старую булку при добавлении новой', () => {
      const anotherBun: TIngredient = {
        ...mockBun,
        _id: 'new-bun-id',
        name: 'Флюоресцентная булка'
      };
      const stateWithBun = reducer(initialState, addIngredient(mockBun));
      const result = reducer(stateWithBun, addIngredient(anotherBun));
      expect(result.bun?._id).toBe('new-bun-id');
      expect(result.bun?.name).toBe('Флюоресцентная булка');
    });

    it('должен добавить начинку в массив ingredients', () => {
      const result = reducer(initialState, addIngredient(mockIngredient));
      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]._id).toBe(mockIngredient._id);
    });

    it('должен добавить соус в массив ingredients', () => {
      const result = reducer(initialState, addIngredient(mockSauce));
      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].type).toBe('sauce');
    });

    it('должен присвоить уникальный id каждому добавленному ингредиенту', () => {
      const state1 = reducer(initialState, addIngredient(mockIngredient));
      const state2 = reducer(state1, addIngredient(mockIngredient));
      expect(state2.ingredients[0].id).not.toBe(state2.ingredients[1].id);
    });

    it('не должен добавлять булку в массив ingredients', () => {
      const result = reducer(initialState, addIngredient(mockBun));
      expect(result.ingredients).toHaveLength(0);
    });
  });

  // ─── removeIngredient ─────────────────────────────────────────────────────

  describe('removeIngredient', () => {
    it('должен удалить ингредиент из массива по id', () => {
      const stateWithItem = reducer(
        initialState,
        addIngredient(mockIngredient)
      );
      const addedId = stateWithItem.ingredients[0].id;
      const result = reducer(stateWithItem, removeIngredient(addedId));
      expect(result.ingredients).toHaveLength(0);
    });

    it('не должен удалять другие ингредиенты при удалении одного', () => {
      let state = reducer(initialState, addIngredient(mockIngredient));
      state = reducer(state, addIngredient(mockSauce));
      const idToRemove = state.ingredients[0].id;
      const result = reducer(state, removeIngredient(idToRemove));
      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].name).toBe(mockSauce.name);
    });
  });

  // ─── moveIngredient ───────────────────────────────────────────────────────

  describe('moveIngredient', () => {
    it('должен переместить ингредиент вниз (from: 0, to: 1)', () => {
      let state = reducer(initialState, addIngredient(mockIngredient));
      state = reducer(state, addIngredient(mockSauce));
      const firstId = state.ingredients[0].id;
      const result = reducer(state, moveIngredient({ from: 0, to: 1 }));
      expect(result.ingredients[1].id).toBe(firstId);
    });

    it('должен переместить ингредиент вверх (from: 1, to: 0)', () => {
      let state = reducer(initialState, addIngredient(mockIngredient));
      state = reducer(state, addIngredient(mockSauce));
      const secondId = state.ingredients[1].id;
      const result = reducer(state, moveIngredient({ from: 1, to: 0 }));
      expect(result.ingredients[0].id).toBe(secondId);
    });
  });

  // ─── clearConstructor ─────────────────────────────────────────────────────

  describe('clearConstructor', () => {
    it('должен очистить bun и ingredients', () => {
      let state = reducer(initialState, addIngredient(mockBun));
      state = reducer(state, addIngredient(mockIngredient));
      const result = reducer(state, clearConstructor());
      expect(result.bun).toBeNull();
      expect(result.ingredients).toHaveLength(0);
    });
  });

  // ─── createOrder (extraReducers) ──────────────────────────────────────────

  describe('createOrder', () => {
    it('должен очистить конструктор при createOrder.fulfilled', () => {
      let state = reducer(initialState, addIngredient(mockBun));
      state = reducer(state, addIngredient(mockIngredient));
      const action = { type: createOrder.fulfilled.type, payload: {} };
      const result = reducer(state, action);
      expect(result.bun).toBeNull();
      expect(result.ingredients).toHaveLength(0);
    });

    it('не должен изменять состояние при createOrder.pending', () => {
      const stateWithBun = reducer(initialState, addIngredient(mockBun));
      const result = reducer(stateWithBun, { type: createOrder.pending.type });
      expect(result.bun).not.toBeNull();
      expect(result.bun?._id).toBe(mockBun._id);
    });

    it('не должен изменять состояние при createOrder.rejected', () => {
      const stateWithBun = reducer(initialState, addIngredient(mockBun));
      const result = reducer(stateWithBun, {
        type: createOrder.rejected.type,
        error: {}
      });
      expect(result.bun).not.toBeNull();
    });
  });
});
