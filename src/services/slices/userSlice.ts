import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUserApi,
  registerUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
  TLoginData,
  TRegisterData
} from '@api';
import { TUser } from '@utils-types';
import { RootState } from '../store';
import { setCookie, deleteCookie } from '../../utils/cookie';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  error: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  error: null
};

export const fetchUser = createAsyncThunk('user/fetch', async () => {
  const data = await getUserApi();
  return data.user;
});

export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData) => {
    const res = await loginUserApi(data);
    setCookie('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    return res.user;
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const res = await registerUserApi(data);
    setCookie('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    return res.user;
  }
);

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const res = await updateUserApi(data);
    return res.user;
  }
);

export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthChecked = true;
    });
    builder.addCase(fetchUser.rejected, (state) => {
      state.isAuthChecked = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.error = action.error.message ?? 'Ошибка входа';
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.error = action.error.message ?? 'Ошибка регистрации';
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.error = action.error.message ?? 'Ошибка обновления';
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
    });
  }
});

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthChecked = (state: RootState) =>
  state.user.isAuthChecked;
export const selectIsAuth = (state: RootState) => !!state.user.user;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;
