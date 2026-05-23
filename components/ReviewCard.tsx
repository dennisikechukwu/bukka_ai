'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import StarRating from '@/components/StarRating'
import SentimentBadge from '@/components/SentimentBadge'
import { GenerateReviewResponse } from '@/lib/agents'

interface ReviewCardProps extends GenerateReviewResponse {
  onRegenerate: () => void
}

export default function ReviewCard({
  review,
  stars,
  sentiment,
  word_count,
  generation_time_ms,
  onRegenerate,
}: ReviewCardProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(review)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-xl"
      style={{ border: '1px solid #DDD9CF', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* Stars + sentiment */}
      <div className="flex items-center gap-3 flex-wrap">
        <StarRating value={Math.round(stars)} />
        <span style={{ fontSize: '13px', color: '#8C8982' }}>{stars.toFixed(1)} stars</span>
        <SentimentBadge sentiment={sentiment} />
      </div>

      {/* Review body — rendered as markdown */}
      <div
        className="px-4 py-4 rounded-xl"
        style={{ backgroundColor: '#fff', border: '0.5px solid #e8e6e0' }}
      >
        <div
          className="prose-review"
          style={{ fontSize: '14px', fontWeight: 300, lineHeight: 1.85, color: '#2C2C2A' }}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p style={{ margin: '0 0 10px 0', fontWeight: 300, lineHeight: 1.85 }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: 700, color: '#2C2C2A' }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ fontStyle: 'italic', color: '#5F5E5A' }}>{children}</em>
              ),
            }}
          >
            {review}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: '11px', color: '#B0ADA6' }}>{word_count} words</span>
          <span style={{ fontSize: '11px', color: '#D3D1C7' }}>·</span>
          <span style={{ fontSize: '11px', color: '#B0ADA6' }}>{generation_time_ms}ms</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{
              fontSize: '13px',
              fontWeight: 400,
              color: copied ? '#27500A' : '#5F5E5A',
              backgroundColor: copied ? '#EAF3DE' : 'transparent',
              border: '0.5px solid',
              borderColor: copied ? '#27500A' : '#D3D1C7',
            }}
          >
            {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{ fontSize: '13px', fontWeight: 400, color: '#5F5E5A', backgroundColor: 'transparent', border: '0.5px solid #D3D1C7' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F4F0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <RefreshCw size={13} strokeWidth={1.5} />
            Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}
