from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Booking, Genre, Hall, Movie, Seat, Session, Ticket, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ('email',)
    list_display = ('email', 'full_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    search_fields = ('email', 'full_name')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Личные данные', {'fields': ('full_name', 'phone', 'role')}),
        (
            'Права',
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                )
            },
        ),
        ('Даты', {'fields': ('last_login', 'date_joined')}),
    )

    def has_add_permission(self, request):
        return False


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'age_rating', 'duration_min', 'release_date', 'is_active')
    list_filter = ('is_active', 'age_rating', 'genres')
    search_fields = ('title',)
    filter_horizontal = ('genres',)


@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ('name', 'rows_count', 'seats_per_row', 'capacity')


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('hall', 'row_number', 'seat_number', 'is_vip')
    list_filter = ('hall', 'is_vip')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('movie', 'hall', 'starts_at', 'base_price', 'vip_price')
    list_filter = ('hall', 'movie')
    search_fields = ('movie__title',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('code', 'user', 'session', 'status', 'total_price', 'created_at')
    list_filter = ('status',)
    search_fields = ('code', 'user__email')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('booking', 'session', 'seat', 'price')
    list_filter = ('session',)
