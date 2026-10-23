import { z } from 'zod'

export const checkoutSchema = z.object({
  full_name: z.string().min(2, 'Введите имя'),
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  phone: z
    .string()
    .min(10, 'Введите телефон')
    .regex(/^[+\d\s()-]+$/, 'Телефон может содержать только цифры и + ( ) -'),
  card_number: z
    .string()
    .transform((value) => value.replace(/\s/g, ''))
    .refine((value) => /^\d{16}$/.test(value), 'Введите 16 цифр карты'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Формат ММ/ГГ'),
  cvv: z.string().regex(/^\d{3}$/, '3 цифры'),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

export const movieSchema = z.object({
  title: z.string().min(2, 'Введите название'),
  description: z.string().min(10, 'Описание минимум 10 символов'),
  poster_url: z
    .string()
    .refine(
      (value) => value === '' || /^https?:\/\/.+/.test(value),
      'Ссылка должна начинаться с http:// или https://',
    ),
  duration_min: z.number().int().min(1, 'Минимум 1 минута'),
  age_rating: z.string().min(1, 'Выберите рейтинг'),
  release_date: z.string(),
  genre_ids: z.array(z.number()).min(1, 'Выберите хотя бы один жанр'),
  is_active: z.boolean(),
})

export type MovieFormValues = z.infer<typeof movieSchema>

export const sessionSchema = z.object({
  movie: z.number().min(1, 'Выберите фильм'),
  hall: z.number().min(1, 'Выберите зал'),
  starts_at: z.string().min(1, 'Укажите дату и время'),
  base_price: z.number().int().min(0, 'Цена не может быть отрицательной'),
  vip_price: z.number().int().min(0, 'Цена не может быть отрицательной'),
})

export type SessionFormValues = z.infer<typeof sessionSchema>
