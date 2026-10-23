import {
  Armchair,
  Banknote,
  CalendarRange,
  Ticket,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Skeleton } from '@/components/ui/Loaders'
import { ErrorState } from '@/components/ui/States'
import { useDashboard } from '@/hooks/useDashboard'
import { formatDateShort } from '@/lib/dates'
import { cn, formatPrice } from '@/lib/utils'

const COLORS = ['#f5a524', '#f87171', '#a78bfa', '#34d399']

const tooltipStyle = {
  backgroundColor: '#14141b',
  border: '1px solid #2a2a37',
  borderRadius: 12,
  color: '#fff',
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      <div className="mt-4 h-72 w-full">{children}</div>
    </section>
  )
}

export function DashboardPage() {
  const [params, setParams] = useSearchParams()
  const daysParam = Number(params.get('days') ?? '30')
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30
  const { data, isLoading, isError, refetch } = useDashboard(days)

  const changeDays = (value: number) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('days', String(value))
      return next
    })
  }

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-9 w-64" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-84" />
          <Skeleton className="h-84" />
          <Skeleton className="h-84" />
          <Skeleton className="h-84" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <ErrorState
        message="Не удалось загрузить статистику."
        onRetry={() => refetch()}
      />
    )
  }

  const summaryCards = [
    {
      label: 'Выручка',
      value: formatPrice(data.summary.revenue),
      icon: Banknote,
    },
    {
      label: 'Продано билетов',
      value: data.summary.tickets_sold,
      icon: Ticket,
    },
    {
      label: 'Броней',
      value: data.summary.bookings_count,
      icon: CalendarRange,
    },
    {
      label: 'Средняя заполняемость',
      value: `${data.summary.avg_occupancy}%`,
      icon: Armchair,
    },
  ]

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Дашборд</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Выручка, продажи и загрузка залов за выбранный период
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => changeDays(value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                days === value
                  ? 'bg-accent text-black'
                  : 'text-zinc-400 hover:text-white',
              )}
            >
              {value} дней
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-line bg-panel p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">{card.label}</p>
              <card.icon className="size-5 text-accent" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Выручка по дням" description="Линейный график за период">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenue_by_day}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a37" />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickFormatter={(value) => formatDateShort(String(value))}
                minTickGap={24}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}к`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(value) => formatDateShort(String(value))}
                formatter={(value) => [formatPrice(Number(value)), 'Выручка']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f5a524"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Продажи по фильмам"
          description="Топ-5 фильмов по количеству билетов"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.sales_by_movie} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a37" />
              <XAxis type="number" stroke="#71717a" fontSize={11} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="movie"
                stroke="#71717a"
                fontSize={11}
                width={110}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [value, 'Билетов']}
              />
              <Bar dataKey="tickets" fill="#a78bfa" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Брони по статусам"
          description="Круговая диаграмма за период"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.bookings_by_status}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
              >
                {data.bookings_by_status.map((entry, index) => (
                  <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Заполняемость залов"
          description="Процент проданных мест"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.occupancy_by_hall}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a37" />
              <XAxis dataKey="hall" stroke="#71717a" fontSize={11} />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value}%`, 'Заполняемость']}
              />
              <Bar dataKey="percent" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
