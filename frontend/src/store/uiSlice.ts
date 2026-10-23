import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  mobileMenuOpen: boolean
  adminSidebarOpen: boolean
}

const initialState: UiState = {
  mobileMenuOpen: false,
  adminSidebarOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false
    },
    toggleAdminSidebar(state) {
      state.adminSidebarOpen = !state.adminSidebarOpen
    },
    closeAdminSidebar(state) {
      state.adminSidebarOpen = false
    },
  },
})

export const {
  toggleMobileMenu,
  closeMobileMenu,
  toggleAdminSidebar,
  closeAdminSidebar,
} = uiSlice.actions
export default uiSlice.reducer
