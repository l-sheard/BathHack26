# For the Plot - AI Group Trip Planner

A full-stack group trip planning application built during **Bath Hack 2026**. Groups can collaboratively submit their travel preferences and generate multiple trip options that meet the group's requirements while balancing cost, individual preferences, and sustainability.

## 🏆 Bath Hack 2026 Honourable Mention

Received an **Honourable Mention for Best Overall** at Bath Hack 2026.

<img width="959" height="564" alt="landing page" src="https://github.com/user-attachments/assets/6e72d6f1-a419-4b0c-90c1-a67c7e9939e9" />

## Features

- **Collaborative trip planning** — create a trip and share a join link so multiple participants can contribute to the same plan.
- **Travel preferences** — each participant can submit their preferences, including budget and travel requirements.
- **Group dashboard** — organisers can see participants and track who has completed their preferences.
- **AI-assisted trip generation** — generate trip options using an LLM-powered modular planning pipeline.
- **Multiple trip options** — generates three alternatives focused on the cheapest/easiest trip, best preference match, and most sustainable option.
- **Detailed itineraries** — generated options include destinations, dates, transport, accommodation, restaurants, visa information, activities, estimated costs, and trade-offs.
- **Live flight data** — incorporate live flight information into generated travel options.
- **Group voting** — participants can vote for their preferred trip option.

## Tech Stack

- **React & TypeScript** — frontend UI and application logic
- **Tailwind CSS** — application styling
- **Vite** — development and production build tooling
- **Supabase** — PostgreSQL database and backend data storage
- **LangChain & OpenAI** — LLM-powered trip planning and itinerary generation
- **SerpApi** — live flight data for transport planning
