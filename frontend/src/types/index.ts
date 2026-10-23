export type Role = 'viewer' | 'admin'

export interface User {
  id: number
  email: string
  full_name: string
  phone: string
  role: Role
}

export interface Genre {
  id: number
  name: string
}

export interface Movie {
  id: number
  title: string
  description: string
  poster_url: string
  duration_min: number
  age_rating: string
  release_date: string | null
  genres: Genre[]
  is_active: boolean
}

export interface MovieShort {
  id: number
  title: string
  poster_url: string
  duration_min: number
  age_rating: string
}

export interface Hall {
  id: number
  name: string
  rows_count: number
  seats_per_row: number
  capacity: number
}

export interface Session {
  id: number
  movie: MovieShort
  hall: Hall
  starts_at: string
  base_price: number
  vip_price: number
  tickets_left: number
}

export interface Seat {
  id: number
  row_number: number
  seat_number: number
  is_vip: boolean
  is_booked: boolean
}

export interface SessionDetail extends Session {
  seats: Seat[]
}

export type BookingStatus = 'paid' | 'cancelled'

export interface Booking {
  id: number
  code: string
  user_email: string
  session: Session
  status: BookingStatus
  status_display: string
  total_price: number
  seats_snapshot: string[]
  created_at: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface DashboardSummary {
  revenue: number
  tickets_sold: number
  bookings_count: number
  avg_occupancy: number
}

export interface RevenueByDay {
  date: string
  revenue: number
  tickets: number
}

export interface SalesByMovie {
  movie: string
  tickets: number
  revenue: number
}

export interface OccupancyByHall {
  hall: string
  percent: number
  sold: number
}

export interface BookingsByStatus {
  status: BookingStatus
  label: string
  count: number
}

export interface Dashboard {
  summary: DashboardSummary
  revenue_by_day: RevenueByDay[]
  sales_by_movie: SalesByMovie[]
  occupancy_by_hall: OccupancyByHall[]
  bookings_by_status: BookingsByStatus[]
}
