import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Введите email').email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Введите имя'),
    email: z.string().min(1, 'Введите email').email('Некорректный email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Минимум 6 символов'),
    confirm_password: z.string().min(6, 'Повторите пароль'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Пароли не совпадают',
    path: ['confirm_password'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
