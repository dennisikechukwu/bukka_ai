type Sentiment = 'positive' | 'negative' | 'mixed'

interface SentimentBadgeProps {
  sentiment: Sentiment
}

const config: Record<Sentiment, { bg: string; text: string; label: string }> = {
  positive: { bg: '#EAF3DE', text: '#27500A', label: 'Positive' },
  negative: { bg: '#FCEBEB', text: '#791F1F', label: 'Negative' },
  mixed: { bg: '#FAEEDA', text: '#633806', label: 'Mixed' },
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const { bg, text, label } = config[sentiment]
  return (
    <span
      style={{
        backgroundColor: bg,
        color: text,
        fontSize: '12px',
        fontWeight: 400,
        padding: '3px 8px',
        borderRadius: '4px',
        display: 'inline-block',
        lineHeight: 1.4,
      }}
    >
      {label}
    </span>
  )
}
