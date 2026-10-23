import uuid

from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Booking, Genre, Hall, Movie, Seat, Session, Ticket, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['email', 'full_name', 'phone', 'password']

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name']


class MovieSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    genre_ids = serializers.PrimaryKeyRelatedField(
        source='genres',
        queryset=Genre.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Movie
        fields = [
            'id',
            'title',
            'description',
            'poster_url',
            'duration_min',
            'age_rating',
            'release_date',
            'genres',
            'genre_ids',
            'is_active',
        ]


class MovieShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'poster_url', 'duration_min', 'age_rating']


class HallSerializer(serializers.ModelSerializer):
    capacity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Hall
        fields = ['id', 'name', 'rows_count', 'seats_per_row', 'capacity']


class SeatSerializer(serializers.ModelSerializer):
    is_booked = serializers.BooleanField(read_only=True)

    class Meta:
        model = Seat
        fields = ['id', 'row_number', 'seat_number', 'is_vip', 'is_booked']


class SessionSerializer(serializers.ModelSerializer):
    movie = MovieShortSerializer(read_only=True)
    hall = HallSerializer(read_only=True)
    tickets_left = serializers.IntegerField(read_only=True)

    class Meta:
        model = Session
        fields = [
            'id',
            'movie',
            'hall',
            'starts_at',
            'base_price',
            'vip_price',
            'tickets_left',
        ]


class SessionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'movie', 'hall', 'starts_at', 'base_price', 'vip_price']


class SessionDetailSerializer(SessionSerializer):
    seats = serializers.SerializerMethodField()

    class Meta(SessionSerializer.Meta):
        fields = SessionSerializer.Meta.fields + ['seats']

    def get_seats(self, obj):
        booked_ids = set(
            Ticket.objects.filter(session=obj).values_list('seat_id', flat=True)
        )
        seats = obj.hall.seats.all()
        return [
            {
                'id': seat.id,
                'row_number': seat.row_number,
                'seat_number': seat.seat_number,
                'is_vip': seat.is_vip,
                'is_booked': seat.id in booked_ids,
            }
            for seat in seats
        ]


class BookingSerializer(serializers.ModelSerializer):
    session = SessionSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'code',
            'user_email',
            'session',
            'status',
            'status_display',
            'total_price',
            'seats_snapshot',
            'created_at',
        ]


class BookingCreateSerializer(serializers.Serializer):
    session = serializers.PrimaryKeyRelatedField(queryset=Session.objects.all())
    seat_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

    def validate(self, attrs):
        session = attrs['session']
        seat_ids = attrs['seat_ids']

        if session.starts_at <= timezone.now():
            raise serializers.ValidationError('Сеанс уже начался')

        if len(seat_ids) != len(set(seat_ids)):
            raise serializers.ValidationError('Места не должны повторяться')

        seats = list(Seat.objects.filter(hall=session.hall, id__in=seat_ids))
        if len(seats) != len(seat_ids):
            raise serializers.ValidationError('Некоторые места не найдены в этом зале')

        taken = Ticket.objects.filter(
            session=session, seat_id__in=seat_ids
        ).select_related('seat')
        if taken.exists():
            numbers = ', '.join(
                f'ряд {t.seat.row_number}, место {t.seat.seat_number}' for t in taken
            )
            raise serializers.ValidationError(f'Места уже заняты: {numbers}')

        attrs['seats'] = seats
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        session = validated_data['session']
        seats = validated_data['seats']

        total = sum(
            session.vip_price if seat.is_vip else session.base_price for seat in seats
        )
        snapshot = [
            f'Ряд {seat.row_number}, место {seat.seat_number}' for seat in seats
        ]

        try:
            with transaction.atomic():
                booking = Booking.objects.create(
                    user=user,
                    session=session,
                    total_price=total,
                    code=f'KB-{uuid.uuid4().hex[:6].upper()}',
                    seats_snapshot=snapshot,
                )
                Ticket.objects.bulk_create(
                    [
                        Ticket(
                            booking=booking,
                            session=session,
                            seat=seat,
                            price=session.vip_price if seat.is_vip else session.base_price,
                        )
                        for seat in seats
                    ]
                )
        except IntegrityError:
            raise serializers.ValidationError(
                'Пока вы выбирали места, их уже кто-то купил. Обновите схему зала.'
            )

        return booking
