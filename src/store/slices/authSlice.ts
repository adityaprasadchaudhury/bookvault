import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types/index.ts';

const initialToken = localStorage.getItem('bv_token');
const initialUser = localStorage.getItem('bv_user')
  ? JSON.parse(localStorage.getItem('bv_user')!)
  : null;

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('bv_token', token);
      localStorage.setItem('bv_user', JSON.stringify(user));
    },
    updatePurchasedBooks: (state, action: PayloadAction<string>) => {
      if (state.user) {
        const currentList = state.user.purchasedBookIds || [];
        if (!currentList.includes(action.payload)) {
          state.user.purchasedBookIds = [...currentList, action.payload];
          localStorage.setItem('bv_user', JSON.stringify(state.user));
        }
      }
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('bv_token');
      localStorage.removeItem('bv_user');
    },
  },
});

export const { setCredentials, updatePurchasedBooks, logOut } = authSlice.actions;
export default authSlice.reducer;
