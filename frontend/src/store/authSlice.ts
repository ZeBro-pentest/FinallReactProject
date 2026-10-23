import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { User } from '@/types'

type AuthStatus = 'loading' | 'authenticated' | 'guest'

interface AuthState {
  user: User | null
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  status: 'loading',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.status = 'authenticated'
    },
    setGuest(state) {
      state.user = null
      state.status = 'guest'
    },
  },
})

export const { setUser, setGuest } = authSlice.actions
export default authSlice.reducer
