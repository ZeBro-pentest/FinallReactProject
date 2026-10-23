from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Менеджер пользователей, где логин — это email."""

    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        VIEWER = 'viewer', 'Зритель'
        ADMIN = 'admin', 'Администратор'

    username = None
    email = models.EmailField('Email', unique=True)
    full_name = models.CharField('Имя', max_length=120)
    phone = models.CharField('Телефон', max_length=30, blank=True)
    role = models.CharField(
        'Роль', max_length=10, choices=Role.choices, default=Role.VIEWER
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


class Genre(models.Model):
    name = models.CharField('Название', max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Жанр'
        verbose_name_plural = 'Жанры'

    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField('Название', max_length=200)
    description = models.TextField('Описание')
    poster_url = models.URLField('Постер', blank=True)
    duration_min = models.PositiveIntegerField('Длительность, мин', default=90)
    age_rating = models.CharField('Возрастной рейтинг', max_length=10, default='12+')
    release_date = models.DateField('Дата релиза', null=True, blank=True)
    genres = models.ManyToManyField(Genre, related_name='movies', blank=True)
    is_active = models.BooleanField('В прокате', default=True)

    class Meta:
        ordering = ['-release_date', 'title']
        verbose_name = 'Фильм'
        verbose_name_plural = 'Фильмы'

    def __str__(self):
        return self.title


class Hall(models.Model):
    name = models.CharField('Название', max_length=50, unique=True)
    rows_count = models.PositiveIntegerField('Количество рядов', default=8)
    seats_per_row = models.PositiveIntegerField('Мест в ряду', default=10)

    class Meta:
        ordering = ['name']
        verbose_name = 'Зал'
        verbose_name_plural = 'Залы'

    @property
    def capacity(self):
        return self.rows_count * self.seats_per_row

    def __str__(self):
        return self.name


class Seat(models.Model):
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='seats')
    row_number = models.PositiveIntegerField('Ряд')
    seat_number = models.PositiveIntegerField('Место')
    is_vip = models.BooleanField('VIP', default=False)

    class Meta:
        ordering = ['row_number', 'seat_number']
        constraints = [
            models.UniqueConstraint(
                fields=['hall', 'row_number', 'seat_number'],
                name='unique_seat_in_hall',
            )
        ]
        verbose_name = 'Место'
        verbose_name_plural = 'Места'

    def __str__(self):
        return f'{self.hall}: ряд {self.row_number}, место {self.seat_number}'


class Session(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='sessions')
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='sessions')
    starts_at = models.DateTimeField('Начало сеанса')
    base_price = models.PositiveIntegerField('Обычное место, ₸', default=2500)
    vip_price = models.PositiveIntegerField('VIP место, ₸', default=4000)

    class Meta:
        ordering = ['starts_at']
        verbose_name = 'Сеанс'
        verbose_name_plural = 'Сеансы'

    def __str__(self):
        return f'{self.movie} — {self.starts_at:%d.%m.%Y %H:%M}'

    @property
    def tickets_left(self):
        return self.hall.capacity - self.tickets.count()


class Booking(models.Model):
    class Status(models.TextChoices):
        PAID = 'paid', 'Оплачено'
        CANCELLED = 'cancelled', 'Отменено'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='bookings')
    status = models.CharField(
        'Статус', max_length=12, choices=Status.choices, default=Status.PAID
    )
    total_price = models.PositiveIntegerField('Сумма, ₸', default=0)
    code = models.CharField('Код билета', max_length=12, unique=True)
    seats_snapshot = models.JSONField('Места', default=list)
    created_at = models.DateTimeField('Создано', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Бронь'
        verbose_name_plural = 'Брони'

    def __str__(self):
        return f'{self.code} — {self.user.email}'


class Ticket(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='tickets')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='tickets')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='tickets')
    price = models.PositiveIntegerField('Цена, ₸')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'seat'], name='unique_seat_per_session'
            )
        ]
        verbose_name = 'Билет'
        verbose_name_plural = 'Билеты'

    def __str__(self):
        return f'{self.booking.code}: {self.seat}'
