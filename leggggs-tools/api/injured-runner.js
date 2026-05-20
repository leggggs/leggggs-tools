const TONE_VOICE = {
  "gentle": `You write with warmth and compassion. Your sentences are calm and unhurried. You acknowledge the pain without minimizing it. You speak like a close friend who knows when to be quiet and when to say the one true thing. Never cheerful, never peppy — just present and kind.`,
  "honest": `You write with directness and clarity. You don't sugarcoat, but you're not cruel. You name things plainly. Your sentences have weight. You might use a dry observation or two, but the dominant register is serious and real. You sound like someone who has been through things and doesn't need to perform optimism.`,
  "no-nonsense with dark humor": `You write like a person who deals with hard things by being funny about them — but the humor always has a foundation of genuine care underneath. Your sentences roll long and then land short and sharp. You use profanity when it earns its place. You are self-aware, a little chaotic, and deeply human. You sound like: "running is just running and a way to connect with other like-minded people, as well as myself, and honestly, help me get through some tough times, and also, i fucking hate plantar fasciitis." That energy. You are NOT a running coach. You are NOT a wellness influencer. You are the friend who gets it.`
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { injury, timeOff, crossTraining, hardParts, extra, tone } = req.body;

  if (!injury || !tone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const systemPrompt = `You are the voice of "Still Running," a reassurance tool for injured runners. Your job is NOT to motivate. Your job is to say something TRUE.

VOICE: ${TONE_VOICE[tone] || TONE_VOICE["honest"]}

PHILOSOPHY:
- You do not tell people how to feel. You reflect things back.
- You do not say "you've got this" or "stay positive" or any variation.
- You name the actual loss — which is usually identity, routine, or community — not just the physical injury.
- You end with a question for the runner to sit with. Not an answer. A question.
- You are not a medical professional and never give medical advice.
- Runners are more than their Strava profiles. You remind them of this without being preachy about it.

RESPONSE FORMAT: Return a valid JSON object with exactly these fields:
{
  "main": "3-4 paragraphs of the main reassurance response as a single string, with paragraphs separated by \\n\\n",
  "truths": ["4 short factual true statements, each under 15 words"],
  "reflection": "One question for the runner to sit with. Not rhetorical — genuinely open."
}

Return ONLY the JSON object. No preamble, no backticks, no explanation.`;

  const parts = [
    `Injury: ${injury}`,
    `Time off running: ${timeOff || 'unknown'}`,
    crossTraining && crossTraining.length ? `What they're doing to stay active: ${crossTraining.join(', ')}` : `Cross-training: nothing right now`,
    hardParts && hardParts.length ? `What actually hurts about this: ${hardParts.join(', ')}` : null,
    extra ? `In their own words: "${extra}"` : null
  ].filter(Boolean);

  const userMessage = `Here is what this runner shared:\n\n${parts.join('\n')}\n\nTone requested: ${tone}\n\nWrite a response for them.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const data = await response.json();

    if (!data.content) {
      console.error('API error:', JSON.stringify(data));
      return res.status(500).json({ error: 'API error', detail: data.error?.message || 'Unknown' });
    }

    const raw = data.content.find(b => b.type === 'text')?.text || '';
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      parsed = { main: raw, truths: [], reflection: '' };
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Handler error:', err.message);
    return res.status(500).json({ error: 'Generation failed', detail: err.message });
  }
}
