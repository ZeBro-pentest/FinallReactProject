import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { AppLayout } from '@/components/layout/AppLayout'
import {
  GuestRoute,
  ProtectedRoute,
  RoleRoute,
} from '@/components/layout/RouteGuards'
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage'
import { AdminMoviesPage } from '@/pages/admin/AdminMoviesPage'
import { AdminSessionsPage } from '@/pages/admin/AdminSessionsPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { MovieFormPage } from '@/pages/admin/MovieFormPage'
import { SessionFormPage } from '@/pages/admin/SessionFormPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { LoginPage } from '@/pages/LoginPage'
import { MoviePage } from '@/pages/MoviePage'
import { MoviesPage } from '@/pages/MoviesPage'
import { MyTicketsPage } from '@/pages/MyTicketsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SeatSelectionPage } from '@/pages/SeatSelectionPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/movies" replace />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/:id" element={<MoviePage />} />

        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="sessions/:id/seats" element={<SeatSelectionPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="my/tickets" element={<MyTicketsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<RoleRoute />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="movies" element={<AdminMoviesPage />} />
          <Route path="movies/new" element={<MovieFormPage />} />
          <Route path="movies/:id/edit" element={<MovieFormPage />} />
          <Route path="sessions" element={<AdminSessionsPage />} />
          <Route path="sessions/new" element={<SessionFormPage />} />
          <Route path="sessions/:id/edit" element={<SessionFormPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
