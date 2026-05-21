const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bukka-ai.vercel.app'

export type Region = 'yoruba' | 'igbo' | 'hausa' | 'edo' | 'general'
export type Tone = 'expressive' | 'blunt' | 'formal' | 'casual' | 'sarcastic'
export type Sentiment = 'positive' | 'negative' | 'mixed'
export type PriceRange = '$' | '$$' | '$$$' | '$$$$'

export interface PersonaObject {
  name: string
  age?: number
  city?: string
  region: Region
  tone: Tone
  food_preferences: string[]
  avg_star_rating: number
  bio: string
}

export interface BusinessAttributes {
  price_range: PriceRange
  outdoor_seating: boolean
  wifi: boolean
  reservations: boolean
}

export interface BusinessObject {
  name: string
  category: string
  city: string
  state: string
  stars: number
  attributes: BusinessAttributes
}

export interface GenerateReviewRequest {
  persona: PersonaObject
  business: BusinessObject
  context?: string
}

export interface GenerateReviewResponse {
  review: string
  stars: number
  word_count: number
  sentiment: Sentiment
  generation_time_ms: number
}

// ─── Recommender ────────────────────────────────────────────────────────────

export interface HistoryItem {
  business_name: string
  category: string
  stars: number
  notes?: string
}

export interface RecommendationFilters {
  city: string
  state: string
  categories: string[]
  min_stars: number
  max_results: number
  target_domain?: string
}

export interface GetRecommendationsRequest {
  persona: PersonaObject
  filters: RecommendationFilters
  history?: HistoryItem[]
  use_agent_pipeline?: boolean
}

export interface RecommendedBusiness {
  rank: number
  business_id: string
  name: string
  category: string
  city: string
  stars: number
  review_count: number
  reason: string
  match_score: number
}

export interface GetRecommendationsResponse {
  recommendations: RecommendedBusiness[]
  persona_summary: string
  preference_profile: string | null
  cross_domain_inference: string | null
  generation_time_ms: number
}

// ─── Errors ──────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
}

// ─── Fetch helpers ───────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text()
    let message = 'An error occurred.'
    try {
      const parsed = JSON.parse(body)
      message = parsed.detail?.[0]?.msg ?? parsed.detail ?? parsed.message ?? message
    } catch {
      message = body || message
    }
    throw { status: res.status, message } as ApiError
  }
  return res.json() as Promise<T>
}

export async function generateReview(
  payload: GenerateReviewRequest
): Promise<GenerateReviewResponse> {
  try {
    const res = await fetch(`${BASE_URL}/generate-review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<GenerateReviewResponse>(res)
  } catch (err) {
    if ((err as ApiError).status !== undefined) throw err
    throw { status: 0, message: 'Network error. Check your connection.' } as ApiError
  }
}

export async function getRecommendations(
  payload: GetRecommendationsRequest
): Promise<GetRecommendationsResponse> {
  try {
    const res = await fetch(`${BASE_URL}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return handleResponse<GetRecommendationsResponse>(res)
  } catch (err) {
    if ((err as ApiError).status !== undefined) throw err
    throw { status: 0, message: 'Network error. Check your connection.' } as ApiError
  }
}
