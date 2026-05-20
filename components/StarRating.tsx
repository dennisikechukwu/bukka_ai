import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  size?: 'sm' | 'md'
}

export default function StarRating({ value, size = 'md' }: StarRatingProps) {
  const px = size === 'sm' ? 13 : 15
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={px}
          fill={value >= star ? '#EF9F27' : '#e0ddd6'}
          color={value >= star ? '#EF9F27' : '#e0ddd6'}
          strokeWidth={0}
        />
      ))}
    </div>
  )
}
