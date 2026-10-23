from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AdminBookingViewSet,
    BookingViewSet,
    DashboardView,
    GenreViewSet,
    HallViewSet,
    LoginView,
    LogoutView,
    MeView,
    MovieViewSet,
    RegisterView,
    SessionViewSet,
)

router = DefaultRouter()
router.register('movies', MovieViewSet, basename='movies')
router.register('genres', GenreViewSet, basename='genres')
router.register('halls', HallViewSet, basename='halls')
router.register('sessions', SessionViewSet, basename='sessions')
router.register('bookings', BookingViewSet, basename='bookings')
router.register('admin/bookings', AdminBookingViewSet, basename='admin-bookings')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('admin/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
