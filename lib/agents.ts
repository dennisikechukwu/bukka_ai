const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface PersonaObject {
  name: string
  age?: number
  city?: string
  tone: 'expressive' | 'blunt' | 'formal' | 'casual' | 'sarcastic'
  food_preferences: string[]
  avg_star_rating: number
  bio: string
}

export interface BusinessAttributes {
  price_range: '$' | '$$' | '$$$' | '$$$$'
  outdoor_seating: boolean
  wifi: boolean
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
  sentiment: 'positive' | 'negative' | 'mixed'
  generation_time_ms: number
}

export interface RecommendationFilters {
  city: string
  state: string
  categories: string[]
  min_stars: number
  max_results: number
}

export interface GetRecommendationsRequest {
  persona: PersonaObject
  filters: RecommendationFilters
}

export interface RecommendationItem {
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
  recommendations: RecommendationItem[]
  persona_summary: string
  generation_time_ms: number
}

export interface ApiError {
  status: number
  message: string
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text()
    let message = 'An error occurred.'
    try {
      const parsed = JSON.parse(body)
      message = parsed.detail || parsed.message || message
    } catch {
      message = body || message
    }
    throw { status: res.status, message } as ApiError
  }
  return res.json() as Promise<T>
}

export async function generateReview(payload: GenerateReviewRequest): Promise<GenerateReviewResponse> {
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

export async function getRecommendations(payload: GetRecommendationsRequest): Promise<GetRecommendationsResponse> {
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
