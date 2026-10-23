import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Seat, Session } from '@/types'

interface BookingState {
  session: Session | null
  selectedSeats: Seat[]
}

const initialState: BookingState = {
  session: null,
  selectedSeats: [],
}

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<Session>) {
      if (state.session?.id !== action.payload.id) {
        state.session = action.payload
        state.selectedSeats = []
      }
    },
    toggleSeat(state, action: PayloadAction<Seat>) {
      const seat = action.payload
      if (seat.is_booked) {
        return
      }
      const exists = state.selectedSeats.some((item) => item.id === seat.id)
      if (exists) {
        state.selectedSeats = state.selectedSeats.filter(
          (item) => item.id !== seat.id,
        )
      } else {
        state.selectedSeats.push(seat)
      }
    },
    clearBooking(state) {
      state.session = null
      state.selectedSeats = []
    },
  },
})

export const { startSession, toggleSeat, clearBooking } = bookingSlice.actions
export default bookingSlice.reducer
