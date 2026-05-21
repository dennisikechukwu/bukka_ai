'use client'

import { useState, useRef } from 'react'
import { Search, AlertTriangle, Plus, Trash2, Zap, GitBranch } from 'lucide-react'
import { usePersistedPersona } from '@/lib/usePersistedPersona'
import { NIGERIAN_CITIES, NIGERIAN_STATES } from '@/lib/nigeria-locations'
import ReactMarkdown from 'react-markdown'
import PersonaBuilder from '@/components/PersonaBuilder'
import RecommendationCard from '@/components/RecommendationCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import TagInput from '@/components/TagInput'
import {
  getRecommendations,
  PersonaObject,
  RecommendationFilters,
  HistoryItem,
  GetRecommendationsResponse,
  GetRecommendationsRequest,
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

const DEFAULT_FILTERS: RecommendationFilters = {
  city: '',
  state: '',
  categories: [],
  min_stars: 3.0,
  max_results: 5,
  target_domain: '',
}

const DEFAULT_HISTORY_ITEM: HistoryItem = {
  business_name: '',
  category: '',
  stars: 4,
  notes: '',
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
  const { persona, setPersona } = usePersistedPersona(DEFAULT_PERSONA)
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_FILTERS)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [useAgentPipeline, setUseAgentPipeline] = useState(false)
  const [result, setResult] = useState<GetRecommendationsResponse | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Your agent is thinking…')
  const [lastPayload, setLastPayload] = useState<GetRecommendationsRequest | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  function updateFilter<K extends keyof RecommendationFilters>(k: K, v: RecommendationFilters[K]) {
    setFilters((f) => ({ ...f, [k]: v }))
  }

  function addHistoryItem() {
    setHistory((h) => [...h, { ...DEFAULT_HISTORY_ITEM }])
  }

  function updateHistoryItem(index: number, patch: Partial<HistoryItem>) {
    setHistory((h) => h.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeHistoryItem(index: number) {
    setHistory((h) => h.filter((_, i) => i !== index))
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
    const cleanHistory = history.filter((h) => h.business_name.trim())
    const payload: GetRecommendationsRequest = {
      persona,
      filters: {
        ...filters,
        target_domain: filters.target_domain?.trim() || undefined,
      },
      history: cleanHistory.length > 0 ? cleanHistory : undefined,
      use_agent_pipeline: useAgentPipeline,
    }
    setLastPayload(payload)
    runRecommend(payload)
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function handleRetry() {
    if (lastPayload) runRecommend(lastPayload)
  }

  return (
    <div className="w-full flex-1 mx-auto px-6 py-8" style={{ maxWidth: '1200px' }}>
      <div className="mb-8">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#2C2C2A', lineHeight: 1.2 }}>
          Restaurant Recommender
        </h1>
        <p style={{ fontSize: '14px', color: '#8C8982', marginTop: '6px' }}>
          Build your persona, set your filters, and get personalised restaurant picks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ── LEFT ── */}
        <div className="flex flex-col gap-6 input-col">

          {/* Persona */}
          <Section title="Persona">
            <PersonaBuilder value={persona} onChange={setPersona} />
          </Section>

          {/* Visit History */}
          <Section
            title="Visit history"
            subtitle="Optional — activates preference learning"
            action={
              <button
                type="button"
                onClick={addHistoryItem}
                className="flex items-center gap-1 transition-colors duration-150"
                style={{ fontSize: '12px', fontWeight: 700, color: '#D85A30' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#C24E27')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#D85A30')}
              >
                <Plus size={13} strokeWidth={2.5} />
                Add visit
              </button>
            }
          >
            {history.length === 0 ? (
              <button
                type="button"
                onClick={addHistoryItem}
                className="flex items-center justify-center gap-2 w-full rounded-xl transition-all duration-150"
                style={{ height: '64px', border: '1px dashed #D3D1C7', backgroundColor: '#FAFAF8', color: '#B0ADA6', fontSize: '13px' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D85A30'; e.currentTarget.style.color = '#D85A30' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D3D1C7'; e.currentTarget.style.color = '#B0ADA6' }}
              >
                <Plus size={14} strokeWidth={2} />
                Add a past restaurant visit
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((item, i) => (
                  <HistoryItemRow
                    key={i}
                    item={item}
                    index={i}
                    onUpdate={updateHistoryItem}
                    onRemove={removeHistoryItem}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* Filters */}
          <Section title="Filters">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>City</label>
                  <input type="text" list="rc-city-list" value={filters.city} onChange={(e) => updateFilter('city', e.target.value)}
                    placeholder="Lagos" className="h-10 px-3 rounded-lg w-full transition-shadow duration-150" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
                  <datalist id="rc-city-list">
                    {NIGERIAN_CITIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>State</label>
                  <input type="text" list="rc-state-list" value={filters.state} onChange={(e) => updateFilter('state', e.target.value)}
                    placeholder="Lagos" className="h-10 px-3 rounded-lg w-full transition-shadow duration-150" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
                  <datalist id="rc-state-list">
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '12px', color: '#8C8982' }}>Categories</label>
                <TagInput tags={filters.categories} onChange={(t) => updateFilter('categories', t)} placeholder="Type a category and press Enter" />
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_SUGGESTIONS.filter((s) => !filters.categories.includes(s)).map((s) => (
                    <button key={s} type="button"
                      onClick={() => updateFilter('categories', [...filters.categories, s])}
                      className="px-2.5 py-1 rounded transition-all duration-150"
                      style={{ fontSize: '12px', color: '#5F5E5A', backgroundColor: '#F5F4F0', border: '0.5px solid #e8e6e0' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ECEAE4'; e.currentTarget.style.borderColor = '#C8C5BC' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5F4F0'; e.currentTarget.style.borderColor = '#e8e6e0' }}
                    >+ {s}</button>
                  ))}
                </div>
              </div>

              {/* Target domain */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: '12px', color: '#8C8982' }}>
                  Target domain
                  <span style={{ fontSize: '11px', color: '#B0ADA6', marginLeft: '6px' }}>Triggers cross-domain AI reasoning</span>
                </label>
                <input type="text" value={filters.target_domain ?? ''} onChange={(e) => updateFilter('target_domain', e.target.value)}
                  placeholder="e.g. Nightlife, Spas, Coffee Shops…"
                  className="h-10 px-3 rounded-lg w-full transition-shadow duration-150" style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
              </div>

              {/* Min stars */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>Min. stars</label>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#2C2C2A', letterSpacing: '-0.5px' }}>
                    {filters.min_stars.toFixed(1)}
                  </span>
                </div>
                <input type="range" min={1} max={5} step={0.5} value={filters.min_stars}
                  onChange={(e) => updateFilter('min_stars', parseFloat(e.target.value))} style={{ cursor: 'pointer' }} />
                <div className="flex justify-between" style={{ fontSize: '11px', color: '#B0ADA6' }}>
                  <span>1.0</span><span>5.0</span>
                </div>
              </div>

              {/* Max results */}
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '12px', color: '#8C8982' }}>Max results</label>
                <div className="flex items-center gap-2">
                  {([3, 5, 10] as const).map((n) => (
                    <button key={n} type="button" onClick={() => updateFilter('max_results', n)}
                      className="flex-1 h-9 rounded-lg transition-all duration-150"
                      style={{
                        fontSize: '14px', fontWeight: 700,
                        backgroundColor: filters.max_results === n ? '#D85A30' : 'transparent',
                        color: filters.max_results === n ? '#fff' : '#5F5E5A',
                        border: '0.5px solid', borderColor: filters.max_results === n ? '#D85A30' : '#D3D1C7',
                      }}
                      onMouseEnter={(e) => { if (filters.max_results !== n) e.currentTarget.style.backgroundColor = '#F5F4F0' }}
                      onMouseLeave={(e) => { if (filters.max_results !== n) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >{n}</button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Agent pipeline toggle */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150"
            style={{
              border: `1px solid ${useAgentPipeline ? '#D85A30' : '#DDD9CF'}`,
              backgroundColor: useAgentPipeline ? '#FFF9F7' : '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onClick={() => setUseAgentPipeline((v) => !v)}
          >
            <div
              className="flex items-center justify-center rounded-lg shrink-0 mt-0.5"
              style={{ width: '32px', height: '32px', backgroundColor: useAgentPipeline ? '#FFF3EF' : '#F5F4F0' }}
            >
              {useAgentPipeline
                ? <GitBranch size={16} color="#D85A30" strokeWidth={1.5} />
                : <Zap size={16} color="#8C8982" strokeWidth={1.5} />
              }
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#2C2C2A' }}>
                  {useAgentPipeline ? '3-agent pipeline' : 'Fast path'}
                </span>
                <div
                  className="relative inline-flex items-center rounded-full transition-colors duration-200"
                  style={{ width: '36px', height: '20px', backgroundColor: useAgentPipeline ? '#D85A30' : '#D3D1C7', padding: '2px' }}
                >
                  <span className="inline-block rounded-full bg-white transition-transform duration-200"
                    style={{ width: '16px', height: '16px', transform: useAgentPipeline ? 'translateX(16px)' : 'translateX(0)', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#8C8982', lineHeight: 1.5 }}>
                {useAgentPipeline
                  ? 'Preference Analyst → Domain Translator → Ranker. Richer reasoning, ~30s.'
                  : 'Single AI call. Fast results in ~5s.'}
              </p>
            </div>
          </div>

          {/* Submit */}
          <button type="button" onClick={handleSubmit} disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl transition-all duration-150"
            style={{
              fontSize: '14px', fontWeight: 700,
              backgroundColor: isLoading ? '#666664' : '#2C2C2A',
              color: '#fff', border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#1E1E1C' }}
            onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#2C2C2A' }}
          >
            {isLoading ? (
              <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }} aria-hidden="true">
                <circle cx="7" cy="7" r="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" />
                <path d="M7 2 A5 5 0 0 1 12 7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <Search size={16} strokeWidth={1.5} />
            )}
            {isLoading ? 'Finding spots…' : 'Get recommendations'}
          </button>
        </div>

        {/* ── RIGHT ── */}
        <div ref={outputRef} className="flex flex-col gap-4 output-col">
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  title, subtitle, action, children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl"
      style={{ border: '1px solid #DDD9CF', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#2C2C2A' }}>{title}</h2>
          {subtitle && <span style={{ fontSize: '11px', color: '#B0ADA6' }}>{subtitle}</span>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function HistoryItemRow({
  item, index, onUpdate, onRemove,
}: {
  item: HistoryItem
  index: number
  onUpdate: (i: number, patch: Partial<HistoryItem>) => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ border: '0.5px solid #e8e6e0', backgroundColor: '#FAFAF8' }}>
      <div className="grid grid-cols-2 gap-2">
        <input type="text" value={item.business_name} onChange={(e) => onUpdate(index, { business_name: e.target.value })}
          placeholder="Restaurant name" className="h-9 px-3 rounded-lg transition-shadow duration-150"
          style={{ border: '0.5px solid #D3D1C7', fontSize: '13px', color: '#2C2C2A', backgroundColor: '#fff', outline: 'none' }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
        <input type="text" value={item.category} onChange={(e) => onUpdate(index, { category: e.target.value })}
          placeholder="Category" className="h-9 px-3 rounded-lg transition-shadow duration-150"
          style={{ border: '0.5px solid #D3D1C7', fontSize: '13px', color: '#2C2C2A', backgroundColor: '#fff', outline: 'none' }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
      </div>
      <div className="flex items-center gap-2">
        {/* Star picker */}
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((s) => (
            <button key={s} type="button" onClick={() => onUpdate(index, { stars: s })} aria-label={`${s} stars`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill={item.stars >= s ? '#EF9F27' : '#e0ddd6'}>
                <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
              </svg>
            </button>
          ))}
          <span style={{ fontSize: '12px', color: '#8C8982', marginLeft: '4px' }}>{item.stars}.0</span>
        </div>
        <button type="button" onClick={() => onRemove(index)}
          className="ml-auto flex items-center gap-1 transition-colors duration-150"
          style={{ fontSize: '11px', color: '#B0ADA6' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#791F1F')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#B0ADA6')}
        >
          <Trash2 size={12} strokeWidth={1.5} /> Remove
        </button>
      </div>
      <input type="text" value={item.notes ?? ''} onChange={(e) => onUpdate(index, { notes: e.target.value })}
        placeholder="Notes (optional) — what did you like or dislike?"
        className="h-8 px-3 rounded-lg transition-shadow duration-150"
        style={{ border: '0.5px solid #D3D1C7', fontSize: '12px', color: '#2C2C2A', backgroundColor: '#fff', outline: 'none' }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
        onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
    </div>
  )
}

function OutputPanel({
  isLoading, loadingText, result, error, personaName, onRetry,
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
      <div className="flex items-center justify-center rounded-xl"
        style={{ minHeight: '240px', border: '1px solid #DDD9CF', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <LoadingSpinner text={loadingText} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ backgroundColor: '#FCEBEB', border: '0.5px solid #F5BEBE' }}>
        <AlertTriangle size={16} color="#791F1F" strokeWidth={1.5} style={{ marginTop: '1px', flexShrink: 0 }} />
        <p style={{ fontSize: '14px', color: '#791F1F', flex: 1 }}>{error.message || 'Something went wrong. Please try again.'}</p>
        <button type="button" onClick={onRetry}
          className="shrink-0 px-3 py-1.5 rounded-lg transition-colors duration-150"
          style={{ fontSize: '13px', fontWeight: 700, color: '#791F1F', backgroundColor: 'transparent', border: '0.5px solid #791F1F' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FCDBDB')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
          Retry
        </button>
      </div>
    )
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4 result-appear">
        {/* Persona summary */}
        <div className="px-4 py-4 rounded-xl"
          style={{ backgroundColor: '#FFF9F7', borderLeft: '3px solid #D85A30', border: '0.5px solid #FAD9CC', borderLeftWidth: '3px' }}>
          <p style={{ fontSize: '11px', fontWeight: 400, color: '#B0ADA6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Agent&apos;s read on {personaName || 'your persona'}
          </p>
          <p style={{ fontSize: '14px', fontWeight: 300, fontStyle: 'italic', color: '#5F5E5A', lineHeight: 1.75 }}>
            {result.persona_summary}
          </p>
          <p style={{ fontSize: '11px', color: '#B0ADA6', marginTop: '10px' }}>
            {result.generation_time_ms}ms · {result.recommendations.length} results
          </p>
        </div>

        {/* Preference profile — Agent 1 output */}
        {result.preference_profile && (
          <div className="flex flex-col gap-2 px-4 py-4 rounded-xl"
            style={{ backgroundColor: '#F7F9FF', border: '0.5px solid #C8D4F5' }}>
            <p style={{ fontSize: '11px', color: '#3B4B8C', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Preference Analyst · Agent 1
            </p>
            <div style={{ fontSize: '13px', color: '#2C2C2A', lineHeight: 1.7 }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 8px 0', fontWeight: 300 }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                  ul: ({ children }) => <ul style={{ margin: '0 0 8px 16px', padding: 0 }}>{children}</ul>,
                  li: ({ children }) => <li style={{ marginBottom: '4px', fontWeight: 300 }}>{children}</li>,
                }}
              >
                {result.preference_profile}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Cross-domain inference — Agent 2 output */}
        {result.cross_domain_inference && (
          <div className="flex flex-col gap-2 px-4 py-4 rounded-xl"
            style={{ backgroundColor: '#FFFBF0', border: '0.5px solid #F5D88A' }}>
            <p style={{ fontSize: '11px', color: '#7A5A00', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              Domain Translator · Agent 2
            </p>
            <div style={{ fontSize: '13px', color: '#2C2C2A', lineHeight: 1.7 }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: '0 0 8px 0', fontWeight: 300 }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                  ul: ({ children }) => <ul style={{ margin: '0 0 8px 16px', padding: 0 }}>{children}</ul>,
                  li: ({ children }) => <li style={{ marginBottom: '4px', fontWeight: 300 }}>{children}</li>,
                }}
              >
                {result.cross_domain_inference}
              </ReactMarkdown>
            </div>
          </div>
        )}

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

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl"
      style={{ minHeight: '320px', border: '1px solid #DDD9CF', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-center rounded-full"
        style={{ width: '48px', height: '48px', backgroundColor: '#F5F4F0' }}>
        <Search size={20} color="#B0ADA6" strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: '14px', color: '#B0ADA6', textAlign: 'center', maxWidth: '240px', lineHeight: 1.6 }}>
        Your personalised recommendations will appear here
      </p>
    </div>
  )
}
