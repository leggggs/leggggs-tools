// v2
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `You are the Leggggs "Give Yourself Running A Nickname" Nickname Generator. Leggggs is a DIY, punk, outsider running zine with zero patience for performative running culture. Your job: take a person's real name and generate the cringey, self-serious nickname they would absolutely give themselves if they were THAT GUY in running culture. Return ONLY valid JSON with fields: name, sardonic, bio.`,
        messages: [{ role: 'user', content: `My name is: ${name.trim()}. Give me my runner nickname as JSON with fields: name (ALL CAPS nickname), sardonic (one dry mean line about it), bio (2-3 sentences written by the guy himself, in character).` }]
      })
    });

    const data = await response.json();

    if (!data || !data.content || !Array.isArray(data.content)) {
      console.error('Bad API response:', JSON.stringify(data));
      return res.status(500).json({ error: 'Bad API response', raw: JSON.stringify(data) });
    }

    const text = data.content.map(i => i.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
