# Group Trip Planner MVP

Hackathon-ready full-stack MVP built with React + TypeScript + Tailwind + Supabase.

## Features implemented

- Create trip and store in Supabase
- Generate and share join link
- Join trip as participant
- Full participant preferences form with validation (React Hook Form + Zod)
- Organizer dashboard with completion status
- Rules-based modular planning pipeline generating 3 options
  - Option 1: cheapest/easiest
  - Option 2: best preference match
  - Option 3: most sustainable
- Option detail cards include destination, dates, travel plan, accommodation, restaurants, visa summary, itinerary, cost, and trade-offs
- Voting (one vote per participant)
- Booking progress tracking
- Seed/demo data for quick demo
- Lightweight tests (validation, generation logic, budget, restaurant filtering, UI component)

## Tech stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Data and backend: Supabase Postgres (via Supabase JS)
- Forms: React Hook Form + Zod
- Fetching/mutations: React Query
- Testing: Vitest + Testing Library

## Local setup

1. Install dependencies:

   npm install

2. Copy env file and set values:

   copy .env.example .env

   Set:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_OPENAI_API_KEY (optional, enables AI planner via LangChain)
   - VITE_OPENAI_MODEL (optional, defaults to gpt-4o-mini)
   - VITE_USE_LIVE_FLIGHTS (optional, set true to enable SerpApi transport quotes)
   - VITE_SERPAPI_API_KEY (optional, enables live flight quotes in generation)
   - VITE_SERPAPI_API_BASE (optional, defaults to https://serpapi.com/search.json)

   Optional AI planner packages:
   - npm install langchain @langchain/openai

3. In Supabase SQL editor, run:

   - supabase/schema.sql
   - supabase/seed.sql
   - supabase/demo_flight_trip.sql (optional: creates a fresh flight-focused test trip)
   - supabase/backfill_flight_demo_preferences.sql (optional: fills missing preferences for all participants in FLIGHT26)

4. Start the app:

   npm run dev

5. Open the app and use either:

   - Create Trip flow from landing page
   - Demo trip directly (after seed):
     - Trip ID: 11111111-1111-1111-1111-111111111111
     - Share code: DEMO2026
    - Flight-focused test trip (after demo_flight_trip.sql):
       - Trip ID: 77777777-7777-7777-7777-777777777777
       - Share code: FLIGHT26

## Project structure

- src/pages: landing, create, join, preferences, dashboard
- src/components: reusable UI components
- src/services/tripService.ts: Supabase CRUD
- src/services/generation/agents.ts: modular MVP planner agents and option generator
- src/services/generation/amadeusService.ts: calls SerpApi Google Flights directly from frontend
- src/schemas/preferencesSchema.ts: zod schema + form defaults
- src/data/mockCatalog.ts: mock destination/transport/accommodation/restaurant/activity data
- supabase/schema.sql: database schema
- supabase/seed.sql: demo data
- tests: unit/component tests

## Planning pipeline modules implemented

Inside src/services/generation/agents.ts:

- aggregateConstraints(tripId)
- generateDestinationCandidates(constraints)
- generateTransportPlan(destination, constraints)
- generateAccommodationOption(destination, constraints)
- generateRestaurantRecommendations(destination, constraints)
- generateItinerary(destination, constraints)
- generateVisaAssessments(destination, constraints)
- generateBudgetAssessment(destination, constraints)
- validateTripOption(option, constraints)
- generateTripOptions(tripId)

## Notes for hackathon judges

- This MVP uses seeded/mock travel inventory and can now optionally use a LangChain LLM planner for option generation.
- Transport planning uses mock/fake data by default.
- Set VITE_USE_LIVE_FLIGHTS=true to enable live SerpApi flight quotes during generation.
- Data model and generation services are structured for easy API replacement later.
- If AI env vars are not set (or AI call fails), the app falls back to deterministic generation logic.

## Future integration TODOs

- Move LangChain planner invocation from frontend into a server/edge function so API keys are never exposed to clients
- Move SerpApi flight lookup behind a server/edge function so API keys are never exposed to clients
- Replace mock transport planning with live flight/train providers
- Replace mock accommodation with hotel APIs
- Replace rule-based visa checks with visa API/provider
- Add authenticated organizer/participant roles
- Add real-time subscriptions for live vote and booking updates

## Test commands

- Run tests once:

  npm test

- Watch mode:

  npm run test:watch

## Definition-of-done checklist

You can now:

- Create a trip
- Share a join link
- Add multiple participants
- Submit/edit preferences
- See completion status
- Generate 3 trip options with detailed sections
- Vote on options
- Track booking progress
- Run locally from README instructions
