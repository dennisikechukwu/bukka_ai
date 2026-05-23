# Bukka AI

An AI-powered Nigerian food review and restaurant recommendation platform. Bukka AI writes and reasons in an authentic Nigerian voice — expressive, blunt, formal, or casual — with regional dialect awareness across Yoruba, Igbo, Hausa, and Edo cultural contexts.

---

## Features

### Review Generator
- **Persona Builder** — Name, age, region, tone, average star rating, food preferences, and a free-text bio
- **Visit Context** — Describe the occasion (date night, work lunch, birthday dinner, etc.)
- **Restaurant Form** — Name, category, city/state (Nigerian datalist suggestions), star rating
- **Example Strip** — Three pre-filled examples with active/deselect toggle; click again to clear
- **Persona Persistence** — Persona saved to `localStorage` (`bukka_persona_v1`) so it carries across page refreshes and both tools

### Restaurant Recommender
- **Same Persona Builder** — Shared localStorage key; fill once, available everywhere
- **Visit History** — Add past restaurant visits with name, category, stars, and notes; 30-entry library with one-click shuffle
- **Filters** — City, state, minimum star rating (with low-rating warning), and target domain
- **Domain Select** — Searchable dropdown with 30 non-food domains (Nightlife, Beauty & Spas, Fitness, etc.) that triggers cross-domain AI reasoning
- **AI Mode Toggle** — Switch between *Fast path* (single AI call, ~5s) and *3-agent pipeline* (Preference Analyst → Domain Translator → Ranker, ~30s)
- **Example Strip** — Three pre-filled examples with active/deselect toggle

### General
- Fade-in animation on AI responses
- Professional button loading states with animated spinner
- Scroll-to-output on submit (mobile and desktop)
- Fully responsive — stacked single-column on mobile, two-column grid on `lg:`
- Sticky navbar with active route indicator

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| UI | React | 19 |
| Styling | Tailwind CSS v4 | ^4 |
| Language | TypeScript | ^5 |
| Icons | Lucide React | ^1.16 |
| Markdown | react-markdown | ^10 |
| Font | Lato (Google Fonts) | — |

---

## Project Structure

```
app/
  layout.tsx               # Root layout — Lato font, Navbar, metadata
  globals.css              # Tailwind v4, custom animations, range/scrollbar styles
  icon.svg                 # Favicon (Bukka AI fork icon, coral on white)
  page.tsx                 # Home / redirect
  review-generator/
    page.tsx               # Review Generator page
  recommender/
    page.tsx               # Restaurant Recommender page

components/
  Navbar.tsx               # Sticky top nav with active link indicator
  PersonaBuilder.tsx       # Persona form — name, age, region, tone, bio, food prefs, avg rating
  BusinessForm.tsx         # Restaurant form — name, category, city/state datalists, star picker
  DomainSelect.tsx         # Searchable dropdown for 30 non-food domains
  ReviewCard.tsx           # Displays generated review with stars, sentiment, word count
  RecommendationCard.tsx   # Displays a ranked recommendation result
  MatchScoreBar.tsx        # Visual match score bar used in RecommendationCard
  SentimentBadge.tsx       # Positive / negative / mixed sentiment chip
  StarRating.tsx           # Read-only star display
  TagInput.tsx             # Tag/pill input for food preferences
  LoadingSpinner.tsx       # Animated loading state with text
  ImagePlaceholder.tsx     # Dashed-border placeholder for empty states

lib/
  agents.ts                # TypeScript types + fetch helpers for both API endpoints
  nigeria-locations.ts     # 36 Nigerian states + 60+ major cities (datalist data)
  usePersistedPersona.ts   # localStorage persona hook (key: bukka_persona_v1)
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Replace with the URL of your running backend. If the variable is not set, the app falls back to `https://bukka-ai.vercel.app`.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

All requests are `POST` with `Content-Type: application/json`.

### `POST /generate-review`

**Request**

```ts
{
  persona: {
    name: string
    age?: number
    region: 'yoruba' | 'igbo' | 'hausa' | 'edo' | 'general'
    tone: 'casual' | 'expressive' | 'blunt' | 'formal'
    food_preferences: string[]
    avg_star_rating: number        // 1.0–5.0
    bio: string
  }
  business: {
    name: string
    category: string               // e.g. "Nigerian, Seafood"
    city: string
    state: string
    stars: number                  // 1–5
  }
  context?: string                 // e.g. "Birthday dinner with close friends"
}
```

**Response**

```ts
{
  review: string
  stars: number
  word_count: number
  sentiment: 'positive' | 'negative' | 'mixed'
  generation_time_ms: number
}
```

---

### `POST /recommend`

**Request**

```ts
{
  persona: PersonaObject           // same shape as above
  filters: {
    city: string
    state: string
    min_stars: number              // 1.0–5.0
    max_results: number            // hardcoded to 10
    target_domain?: string | null  // e.g. "Nightlife" — triggers cross-domain reasoning
  }
  history?: {
    business_name: string
    category: string
    stars: number
    notes: string
  }[]
  use_agent_pipeline?: boolean     // false = fast path, true = 3-agent pipeline
}
```

**Response**

```ts
{
  recommendations: {
    rank: number
    business_id: string
    name: string
    category: string
    city: string
    stars: number
    review_count: number
    reason: string
    match_score: number            // 0–100
  }[]
  persona_summary: string
  preference_profile: string | null
  cross_domain_inference: string | null
  generation_time_ms: number
}
```

---

## Deployment (Vercel)

1. Push to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. Add environment variable in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_API_URL` — public URL of your deployed backend
4. Deploy.

Ensure your backend CORS policy allows requests from your Vercel domain.
