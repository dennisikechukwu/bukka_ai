interface MatchScoreBarProps {
  score: number
  rank: number
}

export default function MatchScoreBar({ score, rank }: MatchScoreBarProps) {
  const pct = Math.round(score * 100)
  const fillColor = rank === 1 ? '#D85A30' : '#D3D1C7'

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 overflow-hidden"
        style={{ height: '5px', borderRadius: '999px', backgroundColor: '#F1EFE8' }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: fillColor,
            borderRadius: '999px',
            transition: 'width 400ms ease',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '12px',
          color: '#8C8982',
          fontWeight: 400,
          minWidth: '32px',
          textAlign: 'right',
        }}
      >
        {pct}%
      </span>
    </div>
  )
}
