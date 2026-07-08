# Smart Stadium GenAI Ecosystem (2026 World Cup)

## Overview
This platform provides a GenAI-enabled Smart Stadium & Tournament Operations experience for the 2026 World Cup. It features two distinct perspectives built into a single, high-performance Next.js application:
1. **Public Fan Experience:** A cinematic, fully-responsive dashboard featuring a live Match Schedule Ticker, a real-time interactive 2.5D Living Stadium Map, and an AI Concierge.
2. **Control Room Dashboard:** A protected operations view providing real-time KPI monitoring and GenAI-powered predictive alerts to manage crowd flow.

This project was built with a strict focus on **Code Quality, Problem Statement Alignment, Security, Efficiency, Accessibility, and Testing**.

## Core Features & Problem Statement Alignment
This project directly solves the core challenge: **Building a GenAI-enabled architecture that optimizes venue operations and elevates the tournament experience.**

1. **Dynamic Crowd Management:** 
   - **Solution:** A 2.5D CSS-transformed interactive map driven by real-time mock sensor data. It visualizes crowd density, highlights congested gates in red, and demonstrates AI-driven traffic routing to optimal gates.
2. **Smart Indoor Navigation:** 
   - **Solution:** Topographic routing within the `StadiumMap` dynamically draws safe egress paths around congested areas, acting as a live navigation engine for fans on the ground.
3. **Real-time Decision Support:** 
   - **Solution:** The **Control Room OpCenter** provides operators with live KPIs and predictive GenAI alerts. It synthesizes crowd flow data to generate actionable insights (e.g., "Redirect fans from North Gate to East Gate").
4. **Multi-language Assistance:** 
   - **Solution:** An **AI Concierge (ChatWidget)** powered by the Cerebras API. It uses the real-time match and crowd data as context to provide accurate, localized guidance to fans in any language.

## Architecture & Tech Stack
- **Framework:** Next.js (App Router, Server API Routes, Client Components).
- **Styling:** Tailwind CSS v4 configured with a custom "cinematic night" theme.
- **Animations:** Framer Motion for smooth UI transitions; highly-optimized CSS keyframes for particle rendering.
- **GenAI Integration:** `@cerebras/cerebras_cloud_sdk` securely executed in Next.js backend API routes to prevent API key exposure.
- **Data Flow:** 
  - `src/services/matchData.ts` & `crowdSim.ts` act as mock backend services.
  - Client hooks (`useRealtimeData.ts`) poll these endpoints using configurable constants.
  - GenAI requests seamlessly inject localized state for context-aware generation.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Rename `.env.example` to `.env.local` and add your Cerebras API key:
   ```env
   CEREBRAS_API_KEY=your_actual_key_here
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

4. **Run Tests:**
   The core simulation logic is covered by unit tests using the native Node.js test runner:
   ```bash
   node --test __tests__/crowdSim.test.ts
   ```

## Scale-up Notes (Production Readiness)
To scale this to World-Cup-level traffic:
- **Data Layer:** Replace client-side polling with Server-Sent Events (SSE) or WebSockets managed by a highly available pub/sub system (e.g., Redis or Kafka).
- **Edge Caching:** Cache the match schedule API at the Edge (e.g., Cloudflare Workers or Vercel Edge) since match scores change at most every few seconds, but are read by millions.
- **GenAI Caching:** Implement semantic caching for the AI Concierge to avoid hitting the LLM for identical, frequently asked questions (e.g., "Where is the nearest bathroom to Gate 4?").
- **3D Map:** The CSS 3D map is highly efficient for mobile devices compared to WebGL, but particle counts must be carefully dynamically capped based on the client's `devicePixelRatio` and frame rate.

## Security & Accessibility
- All API keys are stored securely on the server-side via Next.js Route Handlers.
- The 2.5D map includes a "Reset View" button to return to a flat, readable state for standard 2D scrolling and keyboard navigation.
- High-contrast colors (neon green and red against deep navy) ensure readability of operational statuses.
