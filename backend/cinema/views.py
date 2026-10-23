from datetime import timedelta

from django.db.models import Count, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Booking, Genre, Hall, Movie, Session, Ticket
from .permissions import IsAdminOrReadOnly, IsAdminRole
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    GenreSerializer,
    HallSerializer,
    LoginSerializer,
    MovieSerializer,
    RegisterSerializer,
    SessionDetailSerializer,
    SessionSerializer,
    SessionWriteSerializer,
    UserSerializer,
)


def is_admin(user):
    return bool(user and user.is_authenticated and user.role == 'admin')


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.data.get('refresh')
        if not token:
            return Response(
                {'detail': 'Не передан refresh-токен'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            RefreshToken(token).blacklist()
        except TokenError:
            return Response(
                {'detail': 'Токен уже недействителен'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({'detail': 'Выход выполнен'})


class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    pagination_class = None


class MovieViewSet(viewsets.ModelViewSet):
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['age_rating', 'genres', 'is_active']
    ordering_fields = ['release_date', 'title']
    ordering = ['-release_date']

    def get_queryset(self):
        queryset = Movie.objects.prefetch_related('genres')
        if not is_admin(self.request.user):
            queryset = queryset.filter(is_active=True)

        # SQLite не умеет регистронезависимый поиск для кириллицы,
        # поэтому фильтруем по названию и описанию в Python.
        search = self.request.query_params.get('search', '').strip().lower()
        if search:
            ids = [
                movie.id
                for movie in queryset
                if search in movie.title.lower()
                or search in movie.description.lower()
            ]
            queryset = queryset.filter(id__in=ids)

        return queryset


class HallViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    pagination_class = None


class SessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['movie', 'hall']
    ordering_fields = ['starts_at', 'base_price']

    def get_queryset(self):
        queryset = Session.objects.select_related('movie', 'hall').prefetch_related(
            'hall__seats'
        )
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(starts_at__date=date)
        if self.action == 'list':
            if is_admin(self.request.user):
                queryset = queryset.order_by('-starts_at')
            else:
                queryset = queryset.filter(starts_at__gte=timezone.now()).order_by(
                    'starts_at'
                )
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SessionDetailSerializer
        if self.action in ('create', 'update', 'partial_update'):
            return SessionWriteSerializer
        return SessionSerializer


class BookingViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status']
    ordering = ['-created_at']

    def get_queryset(self):
        return (
            Booking.objects.filter(user=self.request.user)
            .select_related('session__movie', 'session__hall', 'user')
            .prefetch_related('tickets')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            BookingSerializer(booking).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {'detail': 'Бронь уже отменена'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=['status'])
        booking.tickets.all().delete()
        return Response(BookingSerializer(booking).data)


class AdminBookingViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = Booking.objects.select_related(
        'session__movie', 'session__hall', 'user'
    ).prefetch_related('tickets')
    serializer_class = BookingSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['status']
    search_fields = ['code', 'user__email', 'user__full_name']
    ordering_fields = ['created_at', 'total_price']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == Booking.Status.CANCELLED:
            return Response(
                {'detail': 'Бронь уже отменена'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=['status'])
        booking.tickets.all().delete()
        return Response(BookingSerializer(booking).data)


class DashboardView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        try:
            days = int(request.query_params.get('days', 30))
        except ValueError:
            days = 30
        days = max(7, min(days, 90))

        now = timezone.now()
        start = timezone.localtime(now).replace(
            hour=0, minute=0, second=0, microsecond=0
        ) - timedelta(days=days - 1)

        bookings = list(
            Booking.objects.filter(
                status=Booking.Status.PAID, created_at__gte=start
            ).prefetch_related('tickets')
        )
        tickets = Ticket.objects.filter(
            booking__status=Booking.Status.PAID,
            booking__created_at__gte=start,
        )

        revenue_by_day = {}
        for offset in range(days):
            day = (start + timedelta(days=offset)).date().isoformat()
            revenue_by_day[day] = {'date': day, 'revenue': 0, 'tickets': 0}

        for booking in bookings:
            day = timezone.localtime(booking.created_at).date().isoformat()
            if day in revenue_by_day:
                revenue_by_day[day]['revenue'] += booking.total_price
                revenue_by_day[day]['tickets'] += booking.tickets.count()

        sales_by_movie = list(
            tickets.values('session__movie__title')
            .annotate(tickets=Count('id'), revenue=Sum('price'))
            .order_by('-tickets')[:5]
        )
        sales_by_movie = [
            {
                'movie': row['session__movie__title'],
                'tickets': row['tickets'],
                'revenue': row['revenue'] or 0,
            }
            for row in sales_by_movie
        ]

        hall_rows = []
        for hall in Hall.objects.all():
            sessions_count = Session.objects.filter(
                hall=hall, starts_at__gte=start, starts_at__lte=now
            ).count()
            sold = tickets.filter(
                session__hall=hall,
                session__starts_at__gte=start,
                session__starts_at__lte=now,
            ).count()
            capacity = sessions_count * hall.capacity
            percent = min(100, round(sold / capacity * 100)) if capacity else 0
            hall_rows.append(
                {'hall': hall.name, 'percent': percent, 'sold': sold}
            )

        bookings_by_status = list(
            Booking.objects.filter(created_at__gte=start)
            .values('status')
            .annotate(count=Count('id'))
        )
        status_labels = dict(Booking.Status.choices)
        bookings_by_status = [
            {
                'status': row['status'],
                'label': status_labels.get(row['status'], row['status']),
                'count': row['count'],
            }
            for row in bookings_by_status
        ]

        revenue = sum(booking.total_price for booking in bookings)
        avg_occupancy = (
            round(sum(row['percent'] for row in hall_rows) / len(hall_rows))
            if hall_rows
            else 0
        )

        return Response(
            {
                'summary': {
                    'revenue': revenue,
                    'tickets_sold': tickets.count(),
                    'bookings_count': len(bookings),
                    'avg_occupancy': avg_occupancy,
                },
                'revenue_by_day': list(revenue_by_day.values()),
                'sales_by_movie': sales_by_movie,
                'occupancy_by_hall': hall_rows,
                'bookings_by_status': bookings_by_status,
            }
        )
