import { Clock } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/Badge'
import { formatDuration } from '@/lib/utils'
import type { Movie } from '@/types'

const fallbackPoster =
  'https://placehold.co/400x600/14141b/f5a524?text=%D0%9A%D0%B8%D0%BD%D0%BE'

export const MovieCard = memo(function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-accent/50"
    >
      <div className="relative aspect-2/3 overflow-hidden bg-panel-soft">
        <img
          src={movie.poster_url || fallbackPoster}
          alt={`Постер фильма «${movie.title}»`}
          loading="lazy"
          className="size-full object-cover transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = fallbackPoster
          }}
        />
        <span className="absolute right-2 top-2 rounded-full bg-black/75 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
          {movie.age_rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-accent">
          {movie.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {movie.genres.slice(0, 2).map((genre) => (
            <Badge key={genre.id}>{genre.name}</Badge>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="size-3.5" />
          {formatDuration(movie.duration_min)}
        </p>
      </div>
    </Link>
  )
})
