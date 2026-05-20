# Yelp AI Agent

An AI-powered food review and restaurant recommendation app with a Nigerian cultural localization layer. The AI writes and thinks in an authentic Nigerian voice — expressive, blunt, or anywhere in between.

## Features

- **Review Generator** — Build a persona, describe the restaurant, generate a Nigerian-voiced Yelp review.
- **Restaurant Recommender** — Tell the AI who you are; it surfaces the restaurants most likely to match your taste.

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- TypeScript
- Lucide React (icons)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and set your API URL:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Replace `http://localhost:8000` with the URL of your running backend.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Connecting to the backend

The app makes two API calls:

| Endpoint | Method | Description |
|---|---|---|
| `/generate-review` | POST | Generate a single restaurant review |
| `/recommend` | POST | Get ranked restaurant recommendations |

Both endpoints expect a `persona` object in the request body. See `lib/agents.ts` for the full TypeScript interface definitions.

## Replacing asset placeholders

All placeholder slots are marked with `// TODO` comments in the source and render a dashed-border box so the UI is never blank.

| Placeholder | Location | What to replace with |
|---|---|---|
| App logo | `components/Navbar.tsx` | Your logo image (SVG or PNG, ~96×32px) |
| Restaurant photo | `components/BusinessForm.tsx` | Real restaurant photo upload |
| Review empty state | `app/review-generator/page.tsx` | Optional illustration |
| Favicon | `public/favicon.ico` | Your app icon (32×32 or 64×64 ICO) |

> **TODO:** Replace `/public/favicon.ico` with a real app icon.

To swap out a placeholder, find the `ImagePlaceholder` component at the `// TODO` comment and replace it with a `next/image` `<Image>` tag pointing to your asset.

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project at [vercel.com](https://vercel.com).
3. In **Settings → Environment Variables** add:
   - `NEXT_PUBLIC_API_URL` — the public URL of your deployed backend
4. Click **Deploy**.

Make sure your backend CORS policy allows requests from your Vercel domain.
