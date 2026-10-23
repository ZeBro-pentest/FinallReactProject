import random
import uuid
from datetime import datetime, time, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from cinema.models import (
    Booking,
    Genre,
    Hall,
    Movie,
    Seat,
    Session,
    Ticket,
    User,
)

GENRES = [
    'Боевик',
    'Приключения',
    'Фантастика',
    'Драма',
    'Комедия',
    'Триллер',
    'Анимация',
    'Ужасы',
]

MOVIES = [
    {
        'title': 'Дюна: Часть вторая',
        'description': 'Пол Атрейдес объединяется с фрименами и мстит за свою семью.',
        'age_rating': '16+',
        'duration_min': 166,
        'genres': ['Фантастика', 'Приключения'],
    },
    {
        'title': 'Интерстеллар',
        'description': 'Команда исследователей отправляется сквозь червоточину, чтобы спасти человечество.',
        'age_rating': '12+',
        'duration_min': 169,
        'genres': ['Фантастика', 'Драма'],
    },
    {
        'title': 'Оппенгеймер',
        'description': 'История создателя атомной бомбы и цена научного открытия.',
        'age_rating': '18+',
        'duration_min': 180,
        'genres': ['Драма', 'Триллер'],
    },
    {
        'title': 'Барби',
        'description': 'Барби покидает идеальный мир и отправляется в реальность.',
        'age_rating': '12+',
        'duration_min': 114,
        'genres': ['Комедия'],
    },
    {
        'title': 'Человек-паук: Паутина вселенных',
        'description': 'Майлз Моралес сталкивается с обществом пауков из разных измерений.',
        'age_rating': '6+',
        'duration_min': 140,
        'genres': ['Анимация', 'Приключения'],
    },
    {
        'title': 'Джон Уик 4',
        'description': 'Наёмный убийца ищет путь к свободе и сражается с Правлением кланов.',
        'age_rating': '18+',
        'duration_min': 169,
        'genres': ['Боевик', 'Триллер'],
    },
    {
        'title': 'Всё везде и сразу',
        'description': 'Обычная женщина открывает в себе силы путешествовать между вселенными.',
        'age_rating': '16+',
        'duration_min': 139,
        'genres': ['Фантастика', 'Комедия'],
    },
    {
        'title': 'Гладиатор',
        'description': 'Римский полководец становится гладиатором и борется за справедливость.',
        'age_rating': '16+',
        'duration_min': 155,
        'genres': ['Боевик', 'Драма'],
    },
    {
        'title': 'Начало',
        'description': 'Специалист по снам получает задачу внедрить идею в чужое сознание.',
        'age_rating': '12+',
        'duration_min': 148,
        'genres': ['Фантастика', 'Триллер'],
    },
    {
        'title': 'Мстители: Финал',
        'description': 'Герои объединяются, чтобы отменить последствия щелчка Таноса.',
        'age_rating': '12+',
        'duration_min': 181,
        'genres': ['Боевик', 'Приключения'],
    },
    {
        'title': 'Бегущий по лезвию 2049',
        'description': 'Офицер Кей ищет правду о своём прошлом в мире репликантов.',
        'age_rating': '16+',
        'duration_min': 164,
        'genres': ['Фантастика', 'Триллер'],
    },
    {
        'title': 'Паразиты',
        'description': 'Бедная семья постепенно проникает в жизнь богатого дома.',
        'age_rating': '18+',
        'duration_min': 132,
        'genres': ['Драма', 'Триллер'],
    },
    {
        'title': 'Властелин колец: Братство Кольца',
        'description': 'Хоббит Фродо отправляется в опасный путь, чтобы уничтожить Кольцо.',
        'age_rating': '12+',
        'duration_min': 178,
        'genres': ['Приключения', 'Драма'],
    },
    {
        'title': 'Отель «Гранд Будапешт»',
        'description': 'Консьерж и его помощник оказываются в центре кражи картины.',
        'age_rating': '16+',
        'duration_min': 99,
        'genres': ['Комедия', 'Приключения'],
    },
    {
        'title': 'Тихое место',
        'description': 'Семья выживает в мире, где любой звук привлекает монстров.',
        'age_rating': '16+',
        'duration_min': 90,
        'genres': ['Ужасы', 'Триллер'],
    },
]

HALLS = [
    ('Зал 1', 8, 10),
    ('Зал 2', 10, 12),
    ('IMAX', 12, 14),
]


class Command(BaseCommand):
    help = 'Наполняет базу демо-данными: фильмы, залы, сеансы и брони'

    def handle(self, *args, **options):
        random.seed(42)
        now = timezone.localtime()

        Ticket.objects.all().delete()
        Booking.objects.all().delete()
        Session.objects.all().delete()
        Seat.objects.all().delete()
        Hall.objects.all().delete()
        Movie.objects.all().delete()
        Genre.objects.all().delete()

        genres = {name: Genre.objects.create(name=name) for name in GENRES}

        movies = []
        for index, data in enumerate(MOVIES):
            movie = Movie.objects.create(
                title=data['title'],
                description=data['description'],
                poster_url=f'https://picsum.photos/seed/cinema-{index + 1}/400/600',
                duration_min=data['duration_min'],
                age_rating=data['age_rating'],
                release_date=(now - timedelta(days=random.randint(30, 900))).date(),
            )
            movie.genres.set([genres[name] for name in data['genres']])
            movies.append(movie)

        halls = []
        for name, rows, seats_per_row in HALLS:
            hall = Hall.objects.create(
                name=name, rows_count=rows, seats_per_row=seats_per_row
            )
            seats = []
            for row in range(1, rows + 1):
                for number in range(1, seats_per_row + 1):
                    seats.append(
                        Seat(
                            hall=hall,
                            row_number=row,
                            seat_number=number,
                            is_vip=row >= rows - 1,
                        )
                    )
            Seat.objects.bulk_create(seats)
            halls.append(hall)

        # Сеансы за последние 30 дней — для графиков.
        sessions = []
        for day_offset in range(30, 0, -1):
            date = (now - timedelta(days=day_offset)).date()
            for movie in random.sample(movies, 2):
                for hour in random.sample([11, 14, 18, 21], 2):
                    hall = random.choice(halls)
                    sessions.append(
                        Session(
                            movie=movie,
                            hall=hall,
                            starts_at=timezone.make_aware(
                                datetime.combine(date, time(hour=hour))
                            ),
                            base_price=random.choice([2000, 2500, 2800, 3200]),
                            vip_price=random.choice([4000, 4500, 5000]),
                        )
                    )

        # Сеансы на ближайшие 14 дней — для покупки билетов.
        for day_offset in range(0, 14):
            date = (now + timedelta(days=day_offset)).date()
            for movie in movies:
                for hour in random.sample([10, 13, 16, 19, 22], 2):
                    hall = random.choice(halls)
                    sessions.append(
                        Session(
                            movie=movie,
                            hall=hall,
                            starts_at=timezone.make_aware(
                                datetime.combine(date, time(hour=hour))
                            ),
                            base_price=random.choice([2200, 2500, 3000, 3500]),
                            vip_price=random.choice([4000, 4800, 5500]),
                        )
                    )

        Session.objects.bulk_create(sessions)
        sessions = list(Session.objects.select_related('hall'))

        users = [
            ('admin@cinema.kz', 'Админ КиноБилет', 'admin', 'Admin123!'),
            ('user@cinema.kz', 'Алия Смагулова', 'viewer', 'User123!'),
            ('anna@cinema.kz', 'Анна Ким', 'viewer', 'User123!'),
            ('erlan@cinema.kz', 'Ерлан Ахметов', 'viewer', 'User123!'),
        ]
        viewers = []
        for email, full_name, role, password in users:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'full_name': full_name,
                    'role': role,
                    'phone': '+7 700 000 00 00',
                    'is_staff': role == 'admin',
                    'is_superuser': role == 'admin',
                },
            )
            if created or not user.check_password(password):
                user.set_password(password)
                user.save()
            if role == 'viewer':
                viewers.append(user)

        past_sessions = [s for s in sessions if s.starts_at < now]
        used = set()
        bookings = []
        created_tickets = []

        for _ in range(700):
            session = random.choice(past_sessions)
            seats = list(session.hall.seats.all())
            free_seats = [
                seat for seat in seats if (session.id, seat.id) not in used
            ]
            if len(free_seats) < 3:
                continue

            chosen = random.sample(free_seats, random.randint(1, 5))
            for seat in chosen:
                used.add((session.id, seat.id))

            total = sum(
                session.vip_price if seat.is_vip else session.base_price
                for seat in chosen
            )
            status = (
                Booking.Status.CANCELLED
                if random.random() < 0.12
                else Booking.Status.PAID
            )
            booking = Booking.objects.create(
                user=random.choice(viewers),
                session=session,
                status=status,
                total_price=total,
                code=f'KB-{uuid.uuid4().hex[:6].upper()}',
                seats_snapshot=[
                    f'Ряд {seat.row_number}, место {seat.seat_number}'
                    for seat in chosen
                ],
            )

            bought_at = session.starts_at - timedelta(
                hours=random.randint(1, 48)
            )
            Booking.objects.filter(pk=booking.pk).update(created_at=bought_at)

            if status == Booking.Status.PAID:
                for seat in chosen:
                    created_tickets.append(
                        Ticket(
                            booking=booking,
                            session=session,
                            seat=seat,
                            price=session.vip_price
                            if seat.is_vip
                            else session.base_price,
                        )
                    )

        Ticket.objects.bulk_create(created_tickets)

        self.stdout.write(self.style.SUCCESS('Демо-данные созданы:'))
        self.stdout.write(f'  фильмов: {Movie.objects.count()}')
        self.stdout.write(f'  залов: {Hall.objects.count()}')
        self.stdout.write(f'  сеансов: {Session.objects.count()}')
        self.stdout.write(f'  броней: {Booking.objects.count()}')
        self.stdout.write(f'  билетов: {Ticket.objects.count()}')
        self.stdout.write('  admin@cinema.kz / Admin123!')
        self.stdout.write('  user@cinema.kz / User123!')
