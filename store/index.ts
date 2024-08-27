import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  githubToken?: string;
}

interface UserState {
  users: { [userId: string]: User };
}

const initialState: UserState = {
  users: {},
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    updateUser: (state: UserState, action: PayloadAction<User>) => {
      const { id, ...userData } = action.payload;
      state.users[id] = { ...state.users[id], ...userData };
    },
    setGithubToken: (state: UserState, action: PayloadAction<{ userId: string; token: string }>) => {
      const { userId, token } = action.payload;
      if (state.users[userId]) {
        state.users[userId].githubToken = token;
      }
    },
  },
});

export const { updateUser, setGithubToken } = userSlice.actions;

export const store = configureStore({
  reducer: {
    users: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;