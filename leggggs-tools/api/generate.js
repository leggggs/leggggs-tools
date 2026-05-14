export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
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
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: 'My name is: ' + name.trim() + '. You are a generator for a DIY running zine called Leggggs. Generate the cringey self-serious nickname this person would give themselves if they were THAT GUY in running culture. Return ONLY raw JSON with three fields: name (the nickname in ALL CAPS), sardonic (one dry mean line about it), bio (2-3 sentences written by the guy himself in character, mentioning PRs, Strava, gear). No backticks, no markdown.'
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
