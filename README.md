# RulesGenie MVP

RulesGenie is an AI-powered board game rules assistant built with Next.js, Tailwind CSS, SQLite, and optional OpenAI integration.

## Features

- Landing page with product overview and clear CTAs
- Rules Q&A interface with session history, citations, and feedback controls
- Searchable game library with 20 supported popular board games
- Quick-start mode with condensed summaries and setup guides
- Mock-auth dashboard for collections, recent questions, and saved answers
- Demo mode that works without any API keys

## Tech Stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS
- SQLite via `better-sqlite3`
- OpenAI API (optional)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. (Optional) Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

- `RULESGENIE_DEMO_MODE=true` keeps the app in mock mode.
- `OPENAI_API_KEY` enables live OpenAI responses.
- `OPENAI_MODEL` overrides the default model (`gpt-4o-mini`).

If no API key is present, the app automatically falls back to demo mode.

## Persistence

The app creates a local `rulesgenie.db` SQLite file in the project root. It stores:

- supported game metadata
- mock user dashboard data
- chat history by session
- saved answers/bookmarks
- answer feedback

## Scripts

- `npm run dev` — start the local development server
- `npm run build` — create a production build
- `npm run start` — run the production server
- `npm run lint` — run Next.js linting
