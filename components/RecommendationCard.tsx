import StarRating from '@/components/StarRating'
import MatchScoreBar from '@/components/MatchScoreBar'

interface RecommendationCardProps {
  rank: number
  name: string
  category: string
  city: string
  stars: number
  review_count: number
  reason: string
  match_score: number
}

export default function RecommendationCard({
  rank,
  name,
  category,
  city,
  stars,
  review_count,
  reason,
  match_score,
}: RecommendationCardProps) {
  const isTop = rank === 1

  const rankBadgeStyle = isTop
    ? { backgroundColor: '#FAEEDA', color: '#633806' }
    : { backgroundColor: '#F1EFE8', color: '#5F5E5A' }

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl transition-all duration-150"
      style={{
        border: '0.5px solid #e8e6e0',
        backgroundColor: '#fff',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C8C5BC')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e8e6e0')}
    >
      {/* Top row: rank + name */}
      <div className="flex items-start gap-3">
        <span
          className="flex items-center justify-center rounded shrink-0"
          style={{
            ...rankBadgeStyle,
            fontSize: '12px',
            fontWeight: 700,
            width: '28px',
            height: '28px',
            marginTop: '1px',
          }}
        >
          #{rank}
        </span>

        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <h3
            className="truncate"
            style={{ fontSize: '16px', fontWeight: 700, color: '#2C2C2A' }}
          >
            {name}
          </h3>
          <p style={{ fontSize: '13px', color: '#8C8982', fontWeight: 400 }}>
            {category}
            {city && (
              <>
                <span style={{ color: '#D3D1C7', margin: '0 4px' }}>·</span>
                {city}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Stars + review count */}
      <div className="flex items-center gap-2">
        <StarRating value={Math.round(stars)} size="sm" />
        <span style={{ fontSize: '13px', color: '#2C2C2A', fontWeight: 400 }}>
          {stars.toFixed(1)}
        </span>
        <span style={{ fontSize: '13px', color: '#B0ADA6' }}>
          ({review_count.toLocaleString()} reviews)
        </span>
      </div>

      {/* Reason */}
      <p
        style={{
          fontSize: '13px',
          fontWeight: 300,
          fontStyle: 'italic',
          color: '#5F5E5A',
          lineHeight: 1.7,
        }}
      >
        {reason}
      </p>

      {/* Match score */}
      <div className="flex flex-col gap-1">
        <span style={{ fontSize: '11px', color: '#B0ADA6', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Match score
        </span>
        <MatchScoreBar score={match_score} rank={rank} />
      </div>
    </div>
  )
}
