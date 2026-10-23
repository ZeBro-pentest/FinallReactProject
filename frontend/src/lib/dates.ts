import dayjs from 'dayjs'
import 'dayjs/locale/ru'

dayjs.locale('ru')

export function formatSessionTime(value: string) {
  return dayjs(value).format('HH:mm')
}

export function formatSessionDate(value: string) {
  return dayjs(value).format('D MMM, HH:mm')
}

export function formatDateTime(value: string) {
  return dayjs(value).format('D MMMM YYYY, HH:mm')
}

export function formatDateShort(value: string) {
  return dayjs(value).format('DD.MM')
}

export function formatDayLabel(value: string) {
  const date = dayjs(value)
  if (date.isSame(dayjs(), 'day')) {
    return 'Сегодня'
  }
  if (date.isSame(dayjs().add(1, 'day'), 'day')) {
    return 'Завтра'
  }
  const label = date.format('dddd, D MMMM')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function toDateTimeInput(value: string) {
  return dayjs(value).format('YYYY-MM-DDTHH:mm')
}
