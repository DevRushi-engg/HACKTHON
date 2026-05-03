const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ─── Gemini API Config (server-side, never exposed to client) ───────────────
const GEMINI_API_KEY = 'AIzaSyDWcutMVHC7dozD1LuBE5YEidhXcKLFDX4';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4000'] }));
app.use(express.json());

// ─── Helper: Call Gemini API ─────────────────────────────────────────────────
async function callGemini(prompt) {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errBody = await response.json();
    throw new Error(`Gemini API error ${response.status}: ${JSON.stringify(errBody)}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// ─── Route: Health Check ─────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Squad Builder Backend is running.' });
});

// ─── Route: Quick Gemini Coach Critique (11-player squad) ────────────────────
// POST /api/critique
// Body: { squad: Player[] }
app.post('/api/critique', async (req, res) => {
  const { squad } = req.body;

  if (!squad || !Array.isArray(squad) || squad.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty squad array.' });
  }

  const squadDetails = squad.map(p => `${p.name} (${p.role}, ₹${p.cost}CR)`).join(', ');
  const prompt = `You are an expert T20 cricket coach. Analyze this IPL squad and provide a concise 3-sentence critique focusing on team balance, strengths, and weaknesses: ${squadDetails}`;

  try {
    let text = await callGemini(prompt);
    if (!text) return res.status(500).json({ error: 'Gemini returned no content.' });

    // Strip markdown bold markers
    text = text.replace(/\*\*/g, '');
    res.json({ critique: text });
  } catch (err) {
    console.error('[/api/critique]', err.message);
    res.status(502).json({ error: err.message });
  }
});

// ─── Route: Deep AI Agent Insights ───────────────────────────────────────────
// POST /api/insights
// Body: { squad: Player[] }
app.post('/api/insights', async (req, res) => {
  const { squad } = req.body;

  if (!squad || !Array.isArray(squad) || squad.length === 0) {
    return res.status(400).json({ error: 'Request body must include a non-empty squad array.' });
  }

  const payloadJson = JSON.stringify(squad, null, 2);
  const prompt = `You are an elite AI Data Analyst for a professional cricket franchise.
I am providing you with the exact JSON payload of our currently selected IPL squad.
Analyze this JSON data and provide a detailed strategic report using the following headers:

## STRATEGIC OVERVIEW
## KEY STRENGTHS
## POTENTIAL VULNERABILITIES
## STAR PLAYERS TO WATCH

Keep the formatting clean and professional. Use short bullet points under each header.

Here is the JSON payload:
${payloadJson}`;

  try {
    let text = await callGemini(prompt);
    if (!text) return res.status(500).json({ error: 'Gemini returned no content.' });

    // Basic Markdown to HTML conversion
    text = text.replace(/### (.*?)\n/g, '<h4 style="color:#94a3b8; margin: 1rem 0 0.25rem;">$1</h4>');
    text = text.replace(/## (.*?)\n/g, '<h3 style="color:#38bdf8; margin-top:1.5rem; margin-bottom:0.5rem; font-size:0.95rem; text-transform:uppercase; letter-spacing:0.05em;">$1</h3>');
    text = text.replace(/# (.*?)\n/g, '<h2 style="color:#22d3ee; margin-top:1.5rem;">$1</h2>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f8fafc;">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\n\n/g, '<br><br>');
    text = text.replace(/\n- (.*?)(?=\n|$)/g, '<br>• $1');
    text = text.replace(/\n/g, '<br>');

    res.json({ insights: text });
  } catch (err) {
    console.error('[/api/insights]', err.message);
    res.status(502).json({ error: err.message });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Squad Builder Backend running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Routes: POST /api/critique | POST /api/insights\n`);
});
