export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answers, buddy } = req.body;
  if (!answers) return res.status(400).json({ error: 'Answers required' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `You are the race generator for Leggggs, a DIY punk outsider running zine. Based on quiz answers, tell someone what race to host themselves. The answer is ALWAYS host your own race — the quiz determines which one.

Race name should be specific, funny, grounded in their answers. Examples: The Refinery Fumes 5K, The Cul-de-Sac Classic, The Parking Garage Time Trial, The Dodging Cars Half Marathon, The 3am Industrial Mile, The Nobody Asked You 10K, The Uninvited Invitational, The Bandit Classic.

Quiz answers:
${answers}

Return ONLY raw JSON, no backticks, no markdown:
{
  "race": "THE RACE NAME IN ALL CAPS",
  "oneliner": "one punchy line. dry. specific. under 12 words. like a tagline on a bad flyer.",
  "body": "Three short paragraphs of zine copy. No headers. No bullet points. Just text. Paragraph 1: the format — distance, vibe, what actually happens. Paragraph 2: the one rule that makes this distinctly not a real race. Start with 'The rule:'. Paragraph 3: how to market it — include ${buddy || 'their friend'} by name with a specific funny slightly threatening text to send them, plus one guerrilla marketing idea. Write like a zine, not a business plan."
}`
        }]
      })
    });

    const data = await response.json();
    if (!data.content) {
      console.error('API error:', JSON.stringify(data));
      return res.status(500).json({ error: JSON.stringify(data) });
    }
    const text = data.content[0].text;
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
