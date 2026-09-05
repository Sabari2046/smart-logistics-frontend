import { createSlice } from '@reduxjs/toolkit';

// Initialize from localStorage safely
const storedToken = localStorage.getItem('token');
let storedUser = null;
try {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    const parsed = JSON.parse(userJson);
    if (parsed && parsed.role) {
      storedUser = parsed;
    }
  }
} catch (e) {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

const isValidAuth = Boolean(storedToken && storedUser && storedUser.role);

const initialState = {
  user: isValidAuth ? storedUser : null,
  token: isValidAuth ? storedToken : null,
  role: isValidAuth ? storedUser.role : null,
  isLoggedIn: isValidAuth,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { token, userId, fullName, email, role, phone } = action.payload;
      const user = { id: userId, fullName, email, role, phone };

      state.token = token;
      state.user = user;
      state.role = role;
      state.isLoggedIn = true;
      state.loading = false;
      state.error = null;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
