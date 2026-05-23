'use client'

import { useState, useRef } from 'react'
import { Search, AlertTriangle, Plus, Trash2, Zap, GitBranch, Shuffle } from 'lucide-react'
import { usePersistedPersona } from '@/lib/usePersistedPersona'
import { NIGERIAN_CITIES, NIGERIAN_STATES } from '@/lib/nigeria-locations'
import ReactMarkdown from 'react-markdown'
import PersonaBuilder from '@/components/PersonaBuilder'
import RecommendationCard from '@/components/RecommendationCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import DomainSelect from '@/components/DomainSelect'
import {
  getRecommendations,
  PersonaObject,
  RecommendationFilters,
  HistoryItem,
  GetRecommendationsResponse,
  GetRecommendationsRequest,
  ApiError,
} from '@/lib/agents'

// ─── Example requests ────────────────────────────────────────────────────────

interface RecommendExample {
  label: string
  persona: Omit<PersonaObject, 'food_preferences'> & { food_preferences: string[] }
  filters: Omit<RecommendationFilters, 'max_results'>
  history: HistoryItem[]
  useAgentPipeline: boolean
}

const RECOMMEND_EXAMPLES: RecommendExample[] = [
  {
    label: 'Emeka in Philadelphia',
    persona: {
      name: 'Emeka', age: 34, region: 'igbo', tone: 'blunt',
      avg_star_rating: 4.0,
      bio: 'Business consultant, eats out 4-5 times a week, no patience for mediocrity',
      food_preferences: ['ofe onugbu', 'pounded yam', 'nkwobi', 'isi ewu', 'grilled fish', 'egusi soup', 'ofe akwu'],
    },
    filters: { city: 'Philadelphia', state: 'PA', min_stars: 3.5, target_domain: null },
    history: [
      { business_name: 'Amara Kitchen', category: 'Nigerian', stars: 5, notes: 'Bold pepper soup, felt at home' },
      { business_name: 'Generic Diner', category: 'American', stars: 2, notes: 'Bland and overpriced' },
    ],
    useAgentPipeline: false,
  },
  {
    label: 'Temi — Nightlife in Atlanta',
    persona: {
      name: 'Temi', age: 27, region: 'yoruba', tone: 'expressive',
      avg_star_rating: 4.2,
      bio: 'Event planner, loves energy and good music, always looking for the next vibe',
      food_preferences: ['suya', 'small chops', 'amala', 'efo riro', 'fried plantain', 'jollof rice', 'puff puff'],
    },
    filters: { city: 'Atlanta', state: 'GA', min_stars: 3.5, target_domain: 'Nightlife' },
    history: [
      { business_name: 'Buka Restaurant', category: 'Nigerian', stars: 5, notes: 'Felt like home, great egusi' },
      { business_name: 'The Spot', category: 'American, Bar', stars: 3, notes: 'Decent drinks but no atmosphere' },
    ],
    useAgentPipeline: true,
  },
  {
    label: 'Cold-start in Las Vegas',
    persona: {
      name: 'Dayo', age: 30, region: 'general', tone: 'casual',
      avg_star_rating: 3.5,
      bio: 'Nigerian visiting Las Vegas for a work conference, new to Bukka AI, loves bold flavours and is open to trying anything good',
      food_preferences: ['jollof rice', 'suya', 'pepper soup', 'grilled chicken', 'fried plantain', 'small chops', 'seafood'],
    },
    filters: { city: 'Las Vegas', state: 'NV', min_stars: 4.0, target_domain: null },
    history: [],
    useAgentPipeline: false,
  },
]

// ─── History library (30 entries) ────────────────────────────────────────────

const HISTORY_LIBRARY: HistoryItem[] = [
  { business_name: 'Buka Restaurant',         category: 'Nigerian',               stars: 5, notes: 'Felt like home, great egusi and pounded yam' },
  { business_name: 'Nkoyo',                   category: 'Nigerian, Continental',  stars: 4, notes: 'Lovely ambience, pricey but worth it for special occasions' },
  { business_name: 'Yellow Chilli',           category: 'Nigerian',               stars: 4, notes: 'Solid jollof rice, service was a bit slow' },
  { business_name: 'Mama Cass',               category: 'Nigerian, Seafood',      stars: 5, notes: 'Best catfish pepper soup in Lagos, always busy' },
  { business_name: 'Amara Kitchen',           category: 'Nigerian',               stars: 5, notes: 'Bold pepper soup, felt right at home' },
  { business_name: 'Cactus Restaurant',       category: 'Nigerian, Continental',  stars: 4, notes: 'Good for groups, food was consistent' },
  { business_name: 'The Spot Bar & Grill',    category: 'American, Bar',          stars: 3, notes: 'Decent drinks but the food was underwhelming' },
  { business_name: 'Zahav',                   category: 'Israeli, Mediterranean', stars: 5, notes: 'Exceptional hummus, one of the best meals I have had abroad' },
  { business_name: 'Generic Diner',           category: 'American',               stars: 2, notes: 'Bland and overpriced, would not return' },
  { business_name: 'KFC Lagos',               category: 'Fast Food, Chicken',     stars: 2, notes: 'Convenient but nothing special, expected better' },
  { business_name: 'Dominos Pizza VI',        category: 'Pizza, Fast Food',       stars: 3, notes: 'Reliable for late nights but nothing exciting' },
  { business_name: 'Chicken Republic',        category: 'Fast Food, Nigerian',    stars: 3, notes: 'Good value, jollof rice is decent for fast food' },
  { business_name: 'The Place Restaurant',    category: 'Nigerian',               stars: 4, notes: 'Great local chain, always consistent with the rice dishes' },
  { business_name: 'Barcelos',               category: 'Continental, Grills',    stars: 4, notes: 'Flame-grilled chicken is excellent, good sides too' },
  { business_name: 'Ocean Basket',            category: 'Seafood',                stars: 4, notes: 'Fresh seafood, a bit pricey but the grilled prawns are worth it' },
  { business_name: 'Hard Rock Cafe Lagos',    category: 'American, Bar',          stars: 3, notes: 'More about the experience than the food, average burger' },
  { business_name: 'Tantalizers',             category: 'Nigerian, Fast Food',    stars: 2, notes: 'Quality has dropped, used to be better' },
  { business_name: 'Mr Biggs',               category: 'Nigerian, Fast Food',    stars: 2, notes: 'Nostalgic but the food quality is inconsistent' },
  { business_name: 'Jevenik',                category: 'Nigerian, Seafood',      stars: 4, notes: 'Excellent pepper soup and catfish, always reliable' },
  { business_name: 'Craft Grill',             category: 'Continental, Grills',    stars: 4, notes: 'Best beef burger in Abuja, great spot for lunch' },
  { business_name: 'Nandos',                 category: 'Grills, Continental',    stars: 4, notes: 'Peri-peri chicken is always on point, fast and consistent' },
  { business_name: 'Kilimanjaro',             category: 'Nigerian, Fast Food',    stars: 3, notes: 'Good shawarma and grills, great for a quick bite' },
  { business_name: 'Ofada Boy',              category: 'Nigerian',               stars: 5, notes: 'Authentic ofada stew experience, one of a kind' },
  { business_name: 'Blackbell Restaurant',   category: 'Continental, Nigerian',  stars: 4, notes: 'Upscale Nigerian food done right, great for business dinners' },
  { business_name: 'Sky Restaurant & Lounge',category: 'Continental, Lounge',    stars: 4, notes: 'Amazing view, food was good but slightly overpriced' },
  { business_name: 'Spice Route',            category: 'Indian, Asian',          stars: 4, notes: 'Great chicken tikka, reminded me of bold Nigerian spice levels' },
  { business_name: 'Haiku',                  category: 'Japanese, Sushi',        stars: 3, notes: 'Decent sushi for Lagos standards, not authentic but enjoyable' },
  { business_name: 'Jade Garden',            category: 'Chinese',                stars: 3, notes: 'Reliable Chinese food, nothing spectacular but solid' },
  { business_name: 'Veggie Victory',         category: 'Vegetarian, Nigerian',   stars: 4, notes: 'Surprisingly flavourful plant-based Nigerian dishes' },
  { business_name: 'Freddies Restaurant',    category: 'Continental',            stars: 3, notes: 'Good pasta, service could be better, nice outdoor seating' },
]

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PERSONA: PersonaObject = {
  name: '', bio: '', region: 'general', tone: 'casual',
  avg_star_rating: 3.5, food_preferences: [],
}

const DEFAULT_FILTERS: RecommendationFilters = {
  city: '', state: '', min_stars: 3.0, max_results: 10, target_domain: null,
}

const inputStyle = {
  border: '0.5px solid #D3D1C7',
  fontSize: '14px',
  color: '#2C2C2A',
  backgroundColor: '#fff',
  outline: 'none',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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
  const [activeExample, setActiveExample] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  function updateFilter<K extends keyof RecommendationFilters>(k: K, v: RecommendationFilters[K]) {
    setFilters((f) => ({ ...f, [k]: v }))
  }

  function addHistoryItem() {
    setHistory((h) => [...h, { business_name: '', category: '', stars: 4, notes: '' }])
  }

  function updateHistoryItem(index: number, patch: Partial<HistoryItem>) {
    setHistory((h) => h.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  function removeHistoryItem(index: number) {
    setHistory((h) => h.filter((_, i) => i !== index))
  }

  function shuffleHistory() {
    const shuffled = [...HISTORY_LIBRARY].sort(() => Math.random() - 0.5)
    setHistory(shuffled.slice(0, 3))
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
    const cleanHistory = history.filter((h) => h.business_name.trim() && h.notes.trim())
    const payload: GetRecommendationsRequest = {
      persona,
      filters: {
        city: filters.city,
        state: filters.state,
        min_stars: filters.min_stars,
        max_results: 10,
        target_domain: filters.target_domain || null,
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

  function loadExample(i: number) {
    if (activeExample === i) {
      // clicking the active example again clears everything
      setPersona(DEFAULT_PERSONA)
      setFilters(DEFAULT_FILTERS)
      setHistory([])
      setUseAgentPipeline(false)
      setActiveExample(null)
      return
    }
    const ex = RECOMMEND_EXAMPLES[i]
    setPersona({ ...DEFAULT_PERSONA, ...ex.persona })
    setFilters({ ...DEFAULT_FILTERS, ...ex.filters })
    setHistory(ex.history)
    setUseAgentPipeline(ex.useAgentPipeline)
    setActiveExample(i)
  }

  return (
    <div className="w-full flex-1 mx-auto px-4 py-6 sm:px-6 sm:py-8" style={{ maxWidth: '1200px' }}>
      <div className="mb-6">
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#2C2C2A', lineHeight: 1.2 }}>
          Restaurant Recommender
        </h1>
        <p style={{ fontSize: '14px', color: '#8C8982', marginTop: '6px' }}>
          Build your persona, set your filters, and get personalised restaurant picks.
        </p>
      </div>

      {/* Example strip */}
      <ExampleStrip examples={RECOMMEND_EXAMPLES} activeIndex={activeExample} onSelect={loadExample} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mt-6">
        {/* ── LEFT ── */}
        <div className="flex flex-col gap-6 input-col">

          {/* Persona */}
          <Section title="Persona">
            <PersonaBuilder
              value={persona}
              onChange={setPersona}
              bioPlaceholder="e.g. Business consultant, eats out 4-5x a week, no patience for mediocrity"
            />
          </Section>

          {/* Visit History */}
          <Section
            title="Visit history"
            subtitle="Optional — activates preference learning"
            action={
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={shuffleHistory}
                  className="flex items-center gap-1 transition-colors duration-150"
                  style={{ fontSize: '12px', fontWeight: 700, color: '#8C8982' }}
                  title="Random picks from history library"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#D85A30')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#8C8982')}
                >
                  <Shuffle size={13} strokeWidth={2} />
                </button>
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
              </div>
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

              {/* City + State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>City</label>
                  <input type="text" list="rc-city-list" value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    placeholder="Lagos" className="h-10 px-3 rounded-lg w-full transition-shadow duration-150" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
                  <datalist id="rc-city-list">
                    {NIGERIAN_CITIES.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label style={{ fontSize: '12px', color: '#8C8982' }}>State</label>
                  <input type="text" list="rc-state-list" value={filters.state}
                    onChange={(e) => updateFilter('state', e.target.value)}
                    placeholder="Lagos" className="h-10 px-3 rounded-lg w-full transition-shadow duration-150" style={inputStyle}
                    onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
                    onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
                  <datalist id="rc-state-list">
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              {/* Target domain */}
              <div className="flex flex-col gap-1.5">
                <label style={{ fontSize: '12px', color: '#8C8982' }}>
                  Target domain
                  <span style={{ fontSize: '11px', color: '#B0ADA6', marginLeft: '6px' }}>Triggers cross-domain AI reasoning</span>
                </label>
                <DomainSelect
                  value={filters.target_domain ?? null}
                  onChange={(val) => updateFilter('target_domain', val)}
                />
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
                  onChange={(e) => updateFilter('min_stars', parseFloat(e.target.value))}
                  style={{ cursor: 'pointer' }} />
                <div className="flex justify-between" style={{ fontSize: '11px', color: '#B0ADA6' }}>
                  <span>1.0</span><span>5.0</span>
                </div>
                {filters.min_stars < 3.0 && (
                  <p style={{ fontSize: '11px', color: '#B87C0A', backgroundColor: '#FFFBF0', border: '0.5px solid #F5D88A', borderRadius: '6px', padding: '6px 10px', lineHeight: 1.5 }}>
                    Results may be fewer at lower star ratings
                  </p>
                )}
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
  title, subtitle, action, children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-xl"
      style={{ border: '1px solid #DDD9CF', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#2C2C2A' }}>{title}</h2>
          {subtitle && <span style={{ fontSize: '11px', color: '#B0ADA6' }}>{subtitle}</span>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
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
  const [notesTouched, setNotesTouched] = useState(false)
  const showNotesError = notesTouched && item.notes.trim() === ''

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ border: '0.5px solid #e8e6e0', backgroundColor: '#FAFAF8' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input type="text" value={item.business_name}
          onChange={(e) => onUpdate(index, { business_name: e.target.value })}
          placeholder="Restaurant name"
          className="h-9 px-3 rounded-lg transition-shadow duration-150"
          style={{ border: '0.5px solid #D3D1C7', fontSize: '13px', color: '#2C2C2A', backgroundColor: '#fff', outline: 'none' }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
        <input type="text" value={item.category}
          onChange={(e) => onUpdate(index, { category: e.target.value })}
          placeholder="e.g. Nigerian, Fast Food, Seafood"
          className="h-9 px-3 rounded-lg transition-shadow duration-150"
          style={{ border: '0.5px solid #D3D1C7', fontSize: '13px', color: '#2C2C2A', backgroundColor: '#fff', outline: 'none' }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
          onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')} />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
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
      <input type="text" value={item.notes}
        onChange={(e) => onUpdate(index, { notes: e.target.value })}
        onBlur={() => setNotesTouched(true)}
        placeholder="e.g. Loved the bold spice, felt like home"
        className="h-8 px-3 rounded-lg transition-shadow duration-150"
        style={{
          border: `0.5px solid ${showNotesError ? '#F5BEBE' : '#D3D1C7'}`,
          fontSize: '12px', color: '#2C2C2A', backgroundColor: '#fff', outline: 'none',
        }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #D85A30, 0 0 0 3px #fff')}
      />
      {showNotesError && (
        <p style={{ fontSize: '11px', color: '#C0392B', marginTop: '-4px' }}>Notes are required</p>
      )}
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
          style={{ backgroundColor: '#FFF9F7', border: '0.5px solid #FAD9CC', borderLeft: '3px solid #D85A30' }}>
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

        {/* Preference profile — Agent 1 */}
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
              >{result.preference_profile}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Cross-domain inference — Agent 2 */}
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
              >{result.cross_domain_inference}</ReactMarkdown>
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
