'use client'

import { useState, useRef } from 'react'
import { Sparkles, ChefHat, AlertTriangle } from 'lucide-react'
import { usePersistedPersona } from '@/lib/usePersistedPersona'
import PersonaBuilder from '@/components/PersonaBuilder'
import BusinessForm from '@/components/BusinessForm'
import ReviewCard from '@/components/ReviewCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import ImagePlaceholder from '@/components/ImagePlaceholder'
import {
  generateReview,
  PersonaObject,
  BusinessObject,
  GenerateReviewResponse,
  GenerateReviewRequest,
  ApiError,
} from '@/lib/agents'

const DEFAULT_PERSONA: PersonaObject = {
  name: '',
  bio: '',
  region: 'general',
  tone: 'casual',
  avg_star_rating: 3.5,
  food_preferences: [],
}

const DEFAULT_BUSINESS: BusinessObject = {
  name: '',
  category: '',
  city: '',
  state: '',
  stars: 4,
  attributes: {
    price_range: '$$',
    outdoor_seating: false,
    wifi: false,
    reservations: false,
  },
}

const inputStyle = {
  border: '0.5px solid #D3D1C7',
  fontSize: '14px',
  color: '#2C2C2A',
  backgroundColor: '#fff',
  outline: 'none',
}

export default function ReviewGeneratorPage() {
  const { persona, setPersona } = usePersistedPersona(DEFAULT_PERSONA)
  const [business, setBusiness] = useState<BusinessObject>(DEFAULT_BUSINESS)
  const [context, setContext] = useState('')
  const [review, setReview] = useState<GenerateReviewResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Your agent is writing…')
  const [lastPayload, setLastPayload] = useState<GenerateReviewRequest | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  async function runGenerate(payload: GenerateReviewRequest) {
    setIsLoading(true)
    setLoadingText('Your agent is writing…')
    setError(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLoadingText('Still working on it…'), 5000)

    try {
      const result = await generateReview(payload)
      setReview(result)
      setError(null)
    } catch (err) {
      setError(err as ApiError)
      setReview(null)
    } finally {
      setIsLoading(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }

  function handleGenerate() {
    const payload: GenerateReviewRequest = {
      persona,
      business,
      context: context.trim() || undefined,
    }
    setLastPayload(payload)
    runGenerate(payload)
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function handleRegenerate() {
    if (lastPayload) runGenerate(lastPayload)
  }

  return (
    <div className="w-full flex-1 mx-auto px-6 py-8" style={{ maxWidth: '1200px' }}>
      {/* Page header */}
      <div className="mb-8">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#2C2C2A', lineHeight: 1.2 }}>
          Review Generator
        </h1>
        <p style={{ fontSize: '14px', color: '#8C8982', marginTop: '6px' }}>
          Build a persona, describe the restaurant, and let the AI write a Nigerian-voiced review.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* LEFT — Input panel */}
        <div className="flex flex-col gap-6 input-col">

          {/* Persona section */}
          <Section title="Persona">
            <PersonaBuilder value={persona} onChange={setPersona} />
          </Section>

          {/* Business section */}
          <Section title="Restaurant">
            <BusinessForm value={business} onChange={setBusiness} />
          </Section>

          {/* Visit context */}
          <Section title="Visit context" subtitle="Optional">
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Date night, solo lunch, work team outing"
              className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          </Section>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-bold transition-all duration-150"
            style={{
              fontSize: '14px',
              fontWeight: 700,
              backgroundColor: isLoading ? '#E8A58A' : '#D85A30',
              color: '#fff',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#C24E27'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#D85A30'
            }}
          >
            {isLoading ? (
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }} aria-hidden="true">
                <circle cx="7" cy="7" r="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" />
                <path d="M7 2 A5 5 0 0 1 12 7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <Sparkles size={16} strokeWidth={1.5} />
            )}
            {isLoading ? 'Generating…' : 'Generate review'}
          </button>
        </div>

        {/* RIGHT — Output panel */}
        <div ref={outputRef} className="flex flex-col gap-4 output-col">
          <OutputPanel
            isLoading={isLoading}
            loadingText={loadingText}
            review={review}
            error={error}
            onRegenerate={handleRegenerate}
            onRetry={handleGenerate}
          />
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-xl"
      style={{ border: '1px solid #DDD9CF', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-baseline gap-2">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#2C2C2A' }}>{title}</h2>
        {subtitle && (
          <span style={{ fontSize: '12px', color: '#B0ADA6', fontWeight: 400 }}>{subtitle}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function OutputPanel({
  isLoading,
  loadingText,
  review,
  error,
  onRegenerate,
  onRetry,
}: {
  isLoading: boolean
  loadingText: string
  review: GenerateReviewResponse | null
  error: ApiError | null
  onRegenerate: () => void
  onRetry: () => void
}) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          minHeight: '240px',
          border: '0.5px solid #e8e6e0',
          backgroundColor: '#ffffff',
        }}
      >
        <LoadingSpinner text={loadingText} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: '#FCEBEB', border: '0.5px solid #F5BEBE' }}
        >
          <AlertTriangle size={16} color="#791F1F" strokeWidth={1.5} style={{ marginTop: '1px', flexShrink: 0 }} />
          <div className="flex flex-col gap-1 flex-1">
            <p style={{ fontSize: '14px', color: '#791F1F', fontWeight: 400 }}>
              {error.message || 'Something went wrong. Please try again.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 px-3 py-1.5 rounded-lg transition-colors duration-150"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#791F1F',
              backgroundColor: 'transparent',
              border: '0.5px solid #791F1F',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FCDBDB')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (review) {
    return (
      <div className="result-appear">
        <ReviewCard
          review={review.review}
          stars={review.stars}
          sentiment={review.sentiment}
          word_count={review.word_count}
          generation_time_ms={review.generation_time_ms}
          onRegenerate={onRegenerate}
        />
      </div>
    )
  }

  // Empty state
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl"
      style={{
        minHeight: '320px',
        border: '0.5px solid #e8e6e0',
        backgroundColor: '#ffffff',
      }}
    >
      {/* TODO: replace with real empty-state illustration */}
      <ImagePlaceholder width="64px" height="64px" icon={ChefHat} label="AI review" />
      <p
        style={{
          fontSize: '14px',
          color: '#B0ADA6',
          fontWeight: 400,
          textAlign: 'center',
          maxWidth: '220px',
          lineHeight: 1.6,
        }}
      >
        Your AI-generated review will appear here
      </p>
    </div>
  )
}
