export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(value: number) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₸`
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} ч ${rest} мин` : `${hours} ч`
}

export function getPageFromParams(params: URLSearchParams) {
  const page = Number(params.get('page') ?? '1')
  return Number.isFinite(page) && page > 0 ? page : 1
}
