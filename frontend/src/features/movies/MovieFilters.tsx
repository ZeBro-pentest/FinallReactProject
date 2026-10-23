import { Search, SlidersHorizontal } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Field'
import type { Genre } from '@/types'

interface MovieFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  genre: string
  onGenreChange: (value: string) => void
  age: string
  onAgeChange: (value: string) => void
  ordering: string
  onOrderingChange: (value: string) => void
  genres: Genre[]
}

export function MovieFilters({
  search,
  onSearchChange,
  genre,
  onGenreChange,
  age,
  onAgeChange,
  ordering,
  onOrderingChange,
  genres,
}: MovieFiltersProps) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
        <SlidersHorizontal className="size-4" />
        Фильтры
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Поиск по названию"
            className="pl-9"
            aria-label="Поиск фильмов"
          />
        </div>

        <Select
          value={genre}
          onChange={(event) => onGenreChange(event.target.value)}
          aria-label="Жанр"
        >
          <option value="">Все жанры</option>
          {genres.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>

        <Select
          value={age}
          onChange={(event) => onAgeChange(event.target.value)}
          aria-label="Возрастной рейтинг"
        >
          <option value="">Любой возраст</option>
          <option value="6+">6+</option>
          <option value="12+">12+</option>
          <option value="16+">16+</option>
          <option value="18+">18+</option>
        </Select>

        <Select
          value={ordering}
          onChange={(event) => onOrderingChange(event.target.value)}
          aria-label="Сортировка"
        >
          <option value="-release_date">Сначала новые</option>
          <option value="release_date">Сначала старые</option>
          <option value="title">По алфавиту</option>
        </Select>
      </div>
    </div>
  )
}
