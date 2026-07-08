# PitchPulse - Smart Stadium Management Platform

PitchPulse is a GenAI-enabled architecture designed to directly optimize venue operations and elevate the tournament experience for fans, organizers, volunteers, and on-ground staff during the 2026 World Cup.

## 🎯 Problem Statement Alignment

This platform was built specifically to address the core challenges of managing massive global sporting events, leveraging Generative AI and real-time data across four key pillars:

### 1. Dynamic Crowd Management
- **The Challenge:** Preventing dangerous bottlenecks and ensuring smooth fan flow across massive venues.
- **The PitchPulse Solution:** 
  - A real-time topographic stadium map visualizes live crowd density across all stands and gates.
  - Generative AI analyzes this telemetry in the background to automatically identify anomalies and generate dispatch alerts for the Control Room.
  - Staff can instantly lock congested gates or deploy Rapid Response units with one click.

### 2. Smart Indoor Navigation
- **The Challenge:** Helping fans find the fastest route to their seats without walking into heavily congested areas.
- **The PitchPulse Solution:** 
  - The stadium map acts as a live routing engine.
  - When gates become critically congested, the system visually reroutes fans in real-time, displaying alternative paths away from bottlenecks (e.g., routing away from the congested South Gate).

### 3. Real-Time Decision Support
- **The Challenge:** Providing stadium operators with actionable intelligence rather than just raw data.
- **The PitchPulse Solution:** 
  - The **Control Room** provides a secure admin view combining live KPI telemetry (latency, wait times, acoustics, temperatures) with a multi-feed security camera mock.
  - Instead of forcing operators to spot issues, the "GenAI Cerebras" engine parses the data and issues plain-English Incident Dispatch alerts.
  - Staff deployment is handled through an interactive map-targeting system, creating a closed loop between AI detection and human resolution.

### 4. Multi-Language Assistance
- **The Challenge:** Serving an incredibly diverse, global fan base without needing thousands of multilingual volunteers.
- **The PitchPulse Solution:** 
  - **Triona, the AI Concierge:** A 3D animated GenAI agent available directly on the fan dashboard. Triona answers questions about stadium logistics, match schedules, and navigation. 
  - **Real-Time Context Awareness:** Triona isn't just a chatbot; she has direct access to the live crowd simulation data. If a fan asks "Which gate is fastest?", Triona dynamically reads the live congestion data and provides an accurate, real-time recommendation.
  - **Seamless Localization:** The entire dashboard, including Triona, instantly adapts to the user's selected language (e.g., Spanish, Hindi) via a bulletproof native language switcher.

---

## 🏗️ Architecture & Data Flow

The application uses a cleanly separated architecture to ensure scalable performance:

1. **Crowd Simulation Service (`services/crowdSim.ts`):** A headless worker that generates deterministic, oscillating crowd density data to mimic real stadium flows.
2. **Real-time Hooks (`hooks/useRealtimeData.ts`):** Fetches the latest simulation states on a polling interval.
3. **GenAI Layer (`app/api/chat/route.ts`):** 
   - Takes user input and injects the *current stadium context* (crowd data, match schedules) directly into the system prompt.
   - Features a robust fallback chain (Cerebras -> Gemini -> Groq -> Mock) to guarantee uptime.
4. **Presentation Layer (`components/features/`):** 
   - Feature-based structure separating `control-room`, `stadium-map`, `navigation`, and `dashboard` logic.
   - Heavy rendering elements (like the 2.5D map zones) are memoized to prevent performance degradation during frequent state pulses.

## 🚀 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rupakbera21/PitchPulse.git
   cd PitchPulse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename `.env.example` to `.env.local` and add your API keys:
   ```env
   CEREBRAS_API_KEY=your_key_here
   GEMINI_API_KEY=your_key_here
   GROQ_API_KEY=your_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`. 
   *Note: Access the Control Room by clicking the "Control Room" button and using the prototype access code `admin2026`.*

## ⚠️ Known Limitations

- **Simulated Data:** The current version relies on a deterministic data simulation rather than a real Kafka/WebSocket feed from physical turnstiles.
- **Map Interactions:** The 2.5D map is a CSS/SVG hybrid optimized for performance, but it does not support full 3D rotation (pan/tilt).
- **Authentication:** The Control Room utilizes a client-side PIN gate for prototype demonstration purposes. A production deployment would require an OAuth/SSO middleware layer.
