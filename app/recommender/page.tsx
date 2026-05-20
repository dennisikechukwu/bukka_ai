'use client'

import { useState, useRef } from 'react'
import { Search, AlertTriangle } from 'lucide-react'
import PersonaBuilder from '@/components/PersonaBuilder'
import RecommendationCard from '@/components/RecommendationCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import TagInput from '@/components/TagInput'
import {
  getRecommendations,
  PersonaObject,
  RecommendationFilters,
  GetRecommendationsResponse,
  GetRecommendationsRequest,
  ApiError,
} from '@/lib/agents'

const DEFAULT_PERSONA: PersonaObject = {
  name: '',
  bio: '',
  tone: 'casual',
  avg_star_rating: 3.5,
  food_preferences: [],
}

const DEFAULT_FILTERS: RecommendationFilters = {
  city: '',
  state: '',
  categories: [],
  min_stars: 3.0,
  max_results: 5,
}

const CATEGORY_SUGGESTIONS = ['Restaurants', 'Nightlife', 'Bars', 'Fast Food', 'Seafood', 'Grills']

const inputStyle = {
  border: '0.5px solid #D3D1C7',
  fontSize: '14px',
  color: '#2C2C2A',
  backgroundColor: '#fff',
  outline: 'none',
}

export default function RecommenderPage() {
  const [persona, setPersona] = useState<PersonaObject>(DEFAULT_PERSONA)
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS)
  const [result, setResult] = useState<GetRecommendationsResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Your agent is thinking…')
  const [lastPayload, setLastPayload] = useState<GetRecommendationsRequest | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateFilter<K extends keyof RecommendationFilters>(
    key: K,
    val: RecommendationFilters[K]
  ) {
    setFilters((f) => ({ ...f, [key]: val }))
  }

  async function runRecommend(payload: GetRecommendationsRequest) {
    setIsLoading(true)
    setLoadingText('Your agent is thinking…')
    setError(null)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setLoadingText('Still working on it…'), 5000)

    try {
      const res = await getRecommendations(payload)
      setResult(res)
      setError(null)
    } catch (err) {
      setError(err as ApiError)
      setResult(null)
    } finally {
      setIsLoading(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }

  function handleSubmit() {
    const payload: GetRecommendationsRequest = { persona, filters }
    setLastPayload(payload)
    runRecommend(payload)
  }

  function handleRetry() {
    if (lastPayload) runRecommend(lastPayload)
  }

  return (
    <div className="w-full flex-1 mx-auto px-6 py-8" style={{ maxWidth: '1200px' }}>
      {/* Page header */}
      <div className="mb-8">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#2C2C2A', lineHeight: 1.2 }}>
          Restaurant Recommender
        </h1>
        <p style={{ fontSize: '14px', color: '#8C8982', marginTop: '6px' }}>
          Build your persona, set your filters, and get personalised restaurant picks.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* LEFT — Input panel */}
        <div className="flex flex-col gap-6">

          {/* Persona section */}
          <Section title="Persona">
            <PersonaBuilder value={persona} onChange={setPersona} />
          </Section>

          {/* Filters section */}
          <Section title="Filters">
            <div className="flex flex-col gap-4">

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    placeholder="Lagos"
                    className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>State</label>
                  <input
                    type="text"
                    value={filters.state}
                    onChange={(e) => updateFilter('state', e.target.value)}
                    placeholder="LA"
                    className="h-10 px-3 rounded-lg w-full transition-shadow duration-150"
                    style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '12px', color: '#8C8982' }}>Categories</label>
                <TagInput
                  tags={filters.categories}
                  onChange={(t) => updateFilter('categories', t)}
                  placeholder="Type a category and press Enter"
                />
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_SUGGESTIONS.filter((s) => !filters.categories.includes(s)).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => updateFilter('categories', [...filters.categories, s])}
                      className="px-2.5 py-1 rounded transition-all duration-150"
                      style={{
                        fontSize: '12px',
                        fontWeight: 400,
                        color: '#5F5E5A',
                        backgroundColor: '#F5F4F0',
                        border: '0.5px solid #e8e6e0',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#ECEAE4'
                        e.currentTarget.style.borderColor = '#C8C5BC'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F5F4F0'
                        e.currentTarget.style.borderColor = '#e8e6e0'
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Min stars */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>Min. stars</label>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#2C2C2A', letterSpacing: '-0.5px' }}>
                    {filters.min_stars.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={filters.min_stars}
                  onChange={(e) => updateFilter('min_stars', parseFloat(e.target.value))}
                  style={{ cursor: 'pointer' }}
                />
                <div className="flex justify-between" style={{ fontSize: '11px', color: '#B0ADA6' }}>
                  <span>1.0</span>
                  <span>5.0</span>
                </div>
              </div>

              {/* Max results */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '12px', color: '#8C8982' }}>Max results</label>
                <div className="flex items-center gap-2">
                  {([3, 5, 10] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => updateFilter('max_results', n)}
                      className="flex-1 h-9 rounded-lg font-bold transition-all duration-150"
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        backgroundColor: filters.max_results === n ? '#D85A30' : 'transparent',
                        color: filters.max_results === n ? '#fff' : '#5F5E5A',
                        border: '0.5px solid',
                        borderColor: filters.max_results === n ? '#D85A30' : '#D3D1C7',
                      }}
                      onMouseEnter={(e) => {
                        if (filters.max_results !== n) {
                          e.currentTarget.style.backgroundColor = '#F5F4F0'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (filters.max_results !== n) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl transition-all duration-150"
            style={{
              fontSize: '14px',
              fontWeight: 700,
              backgroundColor: isLoading ? '#666664' : '#2C2C2A',
              color: '#fff',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#1E1E1C'
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#2C2C2A'
            }}
          >
            <Search size={16} strokeWidth={1.5} />
            {isLoading ? 'Finding spots…' : 'Get recommendations'}
          </button>
        </div>

        {/* RIGHT — Output panel */}
        <div className="flex flex-col gap-4">
          <OutputPanel
            isLoading={isLoading}
            loadingText={loadingText}
            result={result}
            error={error}
            personaName={persona.name}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-xl"
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
  result,
  error,
  personaName,
  onRetry,
}: {
  isLoading: boolean
  loadingText: string
  result: GetRecommendationsResponse | null
  error: ApiError | null
  personaName: string
  onRetry: () => void
}) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl"
        style={{ minHeight: '240px', border: '0.5px solid #e8e6e0', backgroundColor: '#FAFAF8' }}
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
    )
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4">
        {/* Persona summary card */}
        <div
          className="px-4 py-4 rounded-xl"
          style={{
            backgroundColor: '#FFF9F7',
            borderLeft: '3px solid #D85A30',
            border: '0.5px solid #FAD9CC',
            borderLeftWidth: '3px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 400,
              color: '#B0ADA6',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
            }}
          >
            {`Agent's read on ${personaName || 'your persona'}`}
          </p>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#5F5E5A',
              lineHeight: 1.75,
            }}
          >
            {result.persona_summary}
          </p>
          <p style={{ fontSize: '11px', color: '#B0ADA6', marginTop: '10px' }}>
            {result.generation_time_ms}ms · {result.recommendations.length} results
          </p>
        </div>

        {/* Recommendation cards */}
        <div className="flex flex-col gap-3">
          {result.recommendations.map((rec) => (
            <RecommendationCard
              key={rec.business_id}
              rank={rec.rank}
              name={rec.name}
              category={rec.category}
              city={rec.city}
              stars={rec.stars}
              review_count={rec.review_count}
              reason={rec.reason}
              match_score={rec.match_score}
            />
          ))}
        </div>
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
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: '48px', height: '48px', backgroundColor: '#F5F4F0' }}
      >
        <Search size={20} color="#B0ADA6" strokeWidth={1.5} />
      </div>
      <p
        style={{
          fontSize: '14px',
          color: '#B0ADA6',
          fontWeight: 400,
          textAlign: 'center',
          maxWidth: '240px',
          lineHeight: 1.6,
        }}
      >
        Your personalised recommendations will appear here
      </p>
    </div>
  )
}
