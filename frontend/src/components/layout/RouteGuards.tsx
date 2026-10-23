import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { PageLoader } from '@/components/ui/Loaders'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isAdmin, status } = useAuth()

  if (status === 'loading') {
    return <PageLoader />
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/movies'} replace />
  }

  return <Outlet />
}

export function RoleRoute() {
  const { isAuthenticated, isAdmin, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <PageLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
