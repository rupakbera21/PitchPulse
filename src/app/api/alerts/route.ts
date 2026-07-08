import { NextResponse } from 'next/server';
import { cerebrasClient } from '@/lib/llm-client';

export async function POST(req: Request) {
  try {
    const { crowdState } = await req.json();

    const systemPrompt = `You are the AI Operations Director for the 2026 World Cup Smart Stadium.
Analyze the provided real-time stadium crowd data and generate exactly ONE short, highly critical operational alert.
The alert MUST be concise (under 20 words).
Focus ONLY on the most congested area (status 'red' or highest occupancy).
Include a specific directive (e.g. "Redirect fans to Gate 6").
Format: Just the alert text, nothing else.`;

    if (!cerebrasClient || !process.env.CEREBRAS_API_KEY) {
      // Mock response for the demo if API key is not configured
      const busiestGate = crowdState.busiest_gate || "Gate 4";
      return NextResponse.json({ 
        alerts: [`CRITICAL: Overcrowding at ${busiestGate}. Immediately divert incoming pedestrian flow to adjacent sectors.`],
        timestamp: new Date().toISOString() 
      });
    }

    const chatCompletion = await cerebrasClient!.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(crowdState) }
      ],
      model: 'gemma-4-31b',
    });
    const alertText = (chatCompletion as { choices: { message: { content: string } }[] }).choices[0].message.content;
    return NextResponse.json({ alerts: [alertText], timestamp: new Date().toISOString() });
  } catch {
    // If we hit an AI API rate limit (429) or other failure, gracefully fallback to a smart mock response
    // rather than throwing a 500 error, which causes Next.js to show a dev-mode overlay.
    const crowdState = { busiest_gate: "Gate 4" }; // Safe default
    try {
      const parsedBody = await req.clone().json();
      if (parsedBody && parsedBody.crowdState) {
        Object.assign(crowdState, parsedBody.crowdState);
      }
    } catch {
      // Ignore body parse errors
    }

    return NextResponse.json({ 
      alerts: [`CRITICAL: Overcrowding at ${crowdState.busiest_gate}. Diverting flow. (AI Rate Limited)`],
      timestamp: new Date().toISOString() 
    });
  }
}
