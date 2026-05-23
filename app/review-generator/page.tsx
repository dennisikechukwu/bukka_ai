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

// ─── Example requests ────────────────────────────────────────────────────────

interface ReviewExample {
  label: string
  persona: Omit<PersonaObject, 'food_preferences'> & { food_preferences: string[] }
  business: BusinessObject
  context: string
}

const REVIEW_EXAMPLES: ReviewExample[] = [
  {
    label: 'Lagos Birthday Dinner',
    persona: {
      name: 'Temi', age: 28, region: 'yoruba', tone: 'casual',
      avg_star_rating: 4.0,
      bio: 'Lagos girl, big on vibes and pepper soup, always celebrating something',
      food_preferences: ['pepper soup', 'jollof rice', 'small chops'],
    },
    business: {
      name: 'Cactus Restaurant', category: 'Nigerian, Continental',
      city: 'Victoria Island', state: 'Lagos', stars: 4,
    },
    context: 'Birthday dinner with close friends',
  },
  {
    label: 'Abuja Work Lunch',
    persona: {
      name: 'Emeka', age: 35, region: 'igbo', tone: 'blunt',
      avg_star_rating: 3.5,
      bio: 'Business consultant, no patience for mediocrity, eats out daily',
      food_preferences: ['grilled fish', 'ofada rice'],
    },
    business: {
      name: 'Yellow Chilli', category: 'Nigerian',
      city: 'Abuja', state: 'FCT', stars: 4,
    },
    context: 'Work lunch with a client',
  },
  {
    label: 'Port Harcourt Date Night',
    persona: {
      name: 'Amaka', age: 26, region: 'edo', tone: 'expressive',
      avg_star_rating: 4.5,
      bio: 'Foodie and lifestyle blogger, judges a restaurant by its jollof first',
      food_preferences: ['jollof rice', 'plantain', 'grilled chicken'],
    },
    business: {
      name: 'Mama Cass', category: 'Nigerian, Seafood',
      city: 'Port Harcourt', state: 'Rivers', stars: 4,
    },
    context: 'First date, wanted somewhere chill but impressive',
  },
]

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PERSONA: PersonaObject = {
  name: '', bio: '', region: 'general', tone: 'casual',
  avg_star_rating: 3.5, food_preferences: [],
}

const DEFAULT_BUSINESS: BusinessObject = {
  name: '', category: '', city: '', state: '', stars: 4,
}

const inputStyle = {
  border: '0.5px solid #D3D1C7',
  fontSize: '14px',
  color: '#2C2C2A',
  backgroundColor: '#fff',
  outline: 'none',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewGeneratorPage() {
  const { persona, setPersona } = usePersistedPersona(DEFAULT_PERSONA)
  const [business, setBusiness] = useState<BusinessObject>(DEFAULT_BUSINESS)
  const [context, setContext] = useState('')
  const [review, setReview] = useState<GenerateReviewResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Your agent is writing…')
  const [lastPayload, setLastPayload] = useState<GenerateReviewRequest | null>(null)
  const [activeExample, setActiveExample] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  const isFormValid = Boolean(
    persona.name.trim() &&
    persona.bio.trim() &&
    persona.region &&
    persona.tone &&
    business.name.trim() &&
    business.category.trim() &&
    context.trim()
  )

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
    if (!isFormValid) return
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

  function loadExample(i: number) {
    if (activeExample === i) {
      // clicking the active example again clears everything
      setPersona(DEFAULT_PERSONA)
      setBusiness(DEFAULT_BUSINESS)
      setContext('')
      setActiveExample(null)
      return
    }
    const ex = REVIEW_EXAMPLES[i]
    setPersona({ ...DEFAULT_PERSONA, ...ex.persona })
    setBusiness({ ...DEFAULT_BUSINESS, ...ex.business })
    setContext(ex.context)
    setActiveExample(i)
  }

  return (
    <div className="w-full flex-1 mx-auto px-4 py-6 sm:px-6 sm:py-8" style={{ maxWidth: '1200px' }}>
      {/* Page header */}
      <div className="mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#2C2C2A', lineHeight: 1.2 }}>
          Review Generator
        </h1>
        <p style={{ fontSize: '14px', color: '#8C8982', marginTop: '6px' }}>
          Build a persona, describe the restaurant, and let the AI write a Nigerian-voiced review.
        </p>
      </div>

      {/* Example strip */}
      <ExampleStrip examples={REVIEW_EXAMPLES} activeIndex={activeExample} onSelect={loadExample} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-6">

        {/* LEFT — Input panel */}
        <div className="flex flex-col gap-6 input-col">

          <Section title="Persona">
            <PersonaBuilder
              value={persona}
              onChange={setPersona}
              bioPlaceholder="e.g. Lagos girl, obsessed with spicy food and good ambience, hates slow service"
            />
          </Section>

          {/* Visit context — between Persona and Restaurant */}
          <Section title="Visit context">
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

          <Section title="Restaurant">
            <BusinessForm value={business} onChange={setBusiness} />
          </Section>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !isFormValid}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl transition-all duration-150"
            style={{
              fontSize: '14px',
              fontWeight: 700,
              backgroundColor: isLoading
                ? '#E8A58A'
                : !isFormValid
                ? '#E8E6E0'
                : '#D85A30',
              color: !isFormValid && !isLoading ? '#A8A5A0' : '#fff',
              border: 'none',
              cursor: isLoading || !isFormValid ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isLoading && isFormValid) e.currentTarget.style.backgroundColor = '#C24E27'
            }}
            onMouseLeave={(e) => {
              if (!isLoading && isFormValid) e.currentTarget.style.backgroundColor = '#D85A30'
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExampleStrip({
  examples,
  activeIndex,
  onSelect,
}: {
  examples: { label: string }[]
  activeIndex: number | null
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span style={{ fontSize: '11px', color: '#B0ADA6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
        Try an example:
      </span>
      {examples.map((ex, i) => {
        const isActive = activeIndex === i
        return (
          <button
            key={ex.label}
            type="button"
            onClick={() => onSelect(i)}
            className="px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: isActive ? '#fff' : '#5F5E5A',
              backgroundColor: isActive ? '#D85A30' : '#fff',
              border: `0.5px solid ${isActive ? '#D85A30' : '#DDD9CF'}`,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#D85A30'
                e.currentTarget.style.color = '#D85A30'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#DDD9CF'
                e.currentTarget.style.color = '#5F5E5A'
              }
            }}
          >
            ✦ {ex.label}
          </button>
        )
      })}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col gap-4 p-4 sm:p-5 rounded-xl"
      style={{ border: '1px solid #DDD9CF', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#2C2C2A' }}>{title}</h2>
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
        style={{ minHeight: '240px', border: '0.5px solid #e8e6e0', backgroundColor: '#ffffff' }}
      >
        <LoadingSpinner text={loadingText} />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ backgroundColor: '#FCEBEB', border: '0.5px solid #F5BEBE' }}
      >
        <AlertTriangle size={16} color="#791F1F" strokeWidth={1.5} style={{ marginTop: '1px', flexShrink: 0 }} />
        <p style={{ fontSize: '14px', color: '#791F1F', flex: 1 }}>
          {error.message || 'Something went wrong. Please try again.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 px-3 py-1.5 rounded-lg transition-colors duration-150"
          style={{ fontSize: '13px', fontWeight: 700, color: '#791F1F', backgroundColor: 'transparent', border: '0.5px solid #791F1F' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FCDBDB')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          Retry
        </button>
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

  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl"
      style={{ minHeight: '320px', border: '0.5px solid #e8e6e0', backgroundColor: '#ffffff' }}
    >
      <ImagePlaceholder width="64px" height="64px" icon={ChefHat} label="AI review" />
      <p style={{ fontSize: '14px', color: '#B0ADA6', textAlign: 'center', maxWidth: '220px', lineHeight: 1.6 }}>
        Your AI-generated review will appear here
      </p>
    </div>
  )
}
