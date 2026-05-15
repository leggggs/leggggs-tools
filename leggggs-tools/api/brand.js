export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { summary } = req.body;
  if (!summary) return res.status(400).json({ error: 'Summary required' });

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
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are the brand builder for Leggggs, a DIY punk outsider running zine. You help people in the running space build brands that are actually different — not just another aesthetic pretending not to be an aesthetic.

You are sarcastic, irreverent, and opinionated, but your output is genuinely useful. You do not use words like "community," "journey," "authentic," or "curated" without irony. You call out bullshit but you help people build something real.

Here are examples of the kind of brand names that fit this world — use these as a reference for tone, energy, and specificity when generating a name:
OUTRMILE, DEAD ENZ RUN CO., WRONG DIRECTION, MEDIAN, BACK 40, VACANT LOT RC, DRAINAGE, FRONTAGE, DEAD LETTER, EXXXIT, CURBBITER RC, SKIN VS. SKIN, UNPAID, UNPACED, AWF BRAND, REMAINDERS, UNVERIFIED, NEVER AGAIN, CREOSOTE, MORNING SMOKE, TETANUS, GLASS IN THE RUG, CRACKED, CINDER JUNGLE, POTSHOLE RC, DEAD AT THE BUS STOP, STONE QUARRY, REBARBARIAN, ASSFAULT GANG, BLAKKOUTT, WET ROAD, YOU DIE TODAY, GRAY ZONE, WIND CHILLZ, AMBIENT TEMP, NOBODY ASKED, ZEROCARE, PACE YOURSELF, YEAH WHATEVER, TECHNICALLY RUNNING, NOT A RACE, HALF THE BATTLE, NO FUN RC, GOOD ENOUGH, PARTICIPATION TROPHY RC, LIFE'S A JOKE

Use the "avoid comparison to" answer as a negative brief — steer hard away from those aesthetics, tones, and names.

Here are their answers:
${summary}

Return ONLY raw JSON, no backticks, no markdown:
{
  "name": "THE BRAND NAME IN ALL CAPS — 1-3 words, specific, memorable, rooted in their answers. Reference the example names for energy. Not Scandinavian. Not a tech startup. Not clean. Not aspirational.",
  "tagline": "One line. No bullshit. Under 10 words. Sticker energy.",
  "what": "2-3 sentences on what this brand actually is. Specific. Grounded in their answers. Zine voice, not brand deck.",
  "not": "2-3 sentences on what this brand is NOT. Reference the specific brands/trends they want to avoid by name. Be direct and a little mean about it.",
  "voice": "Three voice rules, each starting with DO or DON'T. Make them specific to this brand.",
  "post": "First social post ready to copy and paste. No hashtags. No emojis. Sounds like a real person. Under 150 characters. Should make someone feel something.",
  "today": "One concrete free action they can take today. Not 'define your brand values.' Something real they can do in the next hour."
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
