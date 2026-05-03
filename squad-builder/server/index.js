const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// ─── Gemini API Config ─────────────────────────────────────
const GEMINI_API_KEY = 'AIzaSyDWcutMVHC7dozD1LuBE5YEidhXcKLFDX4';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// ─── Middleware ────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

// ─── Helper: call Gemini ───────────────────────────────────
async function callGemini(promptText) {
  const response = await fetch(GEMINI_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.json();
    throw new Error(errBody?.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

// ─── Route: GET /api/health ────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'IPL Squad Builder Backend is running', timestamp: new Date().toISOString() });
});

// ─── Route: POST /api/critique ────────────────────────────
// Generates a quick 3-sentence Gemini Coach Critique for the squad
app.post('/api/critique', async (req, res) => {
  const { squad } = req.body;

  if (!squad || !Array.isArray(squad) || squad.length === 0) {
    return res.status(400).json({ error: 'squad array is required in request body' });
  }

  const squadDetails = squad.map(p => `${p.name} (${p.role}, ₹${p.cost}CR)`).join(', ');
  const prompt = `You are an expert T20 cricket coach. Analyze this IPL squad and provide a quick 3-sentence critique focusing on team balance, strengths, and weaknesses: ${squadDetails}`;

  try {
    let text = await callGemini(prompt);
    // Clean up markdown bold markers
    text = text.replace(/\*\*/g, '');
    res.json({ critique: text });
  } catch (error) {
    console.error('[/api/critique] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Route: POST /api/insights ────────────────────────────
// Deep AI Agent analysis of full squad JSON
app.post('/api/insights', async (req, res) => {
  const { squad } = req.body;

  if (!squad || !Array.isArray(squad) || squad.length === 0) {
    return res.status(400).json({ error: 'squad array is required in request body' });
  }

  const payloadJson = JSON.stringify(squad, null, 2);
  const prompt = `You are an elite AI Data Analyst for a professional cricket franchise. I am providing you with the exact JSON payload of our currently selected squad.
Analyze this JSON data and provide a detailed strategic report. Use the following headers:
- STRATEGIC OVERVIEW
- KEY STRENGTHS
- POTENTIAL VULNERABILITIES
- STAR PLAYERS TO WATCH

Keep the formatting clean and professional.

Here is the JSON payload:
${payloadJson}`;

  try {
    let text = await callGemini(prompt);

    // Basic Markdown to HTML conversion
    text = text.replace(/### (.*?)\n/g, '<h4 style="color:#38bdf8;margin:1rem 0 0.25rem">$1</h4>');
    text = text.replace(/## (.*?)\n/g, '<h3 style="color:#38bdf8;margin-top:1.5rem;margin-bottom:0.5rem">$1</h3>');
    text = text.replace(/# (.*?)\n/g, '<h2 style="color:#22d3ee;margin-top:1.5rem">$1</h2>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f8fafc">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/\n\n/g, '<br><br>');
    text = text.replace(/\n- (.*?)/g, '<br>• $1');
    text = text.replace(/\n/g, '<br>');

    res.json({ insights: text });
  } catch (error) {
    console.error('[/api/insights] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ IPL Squad Builder Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   POST /api/critique  — Coach critique for squad`);
  console.log(`   POST /api/insights  — Deep AI agent analysis\n`);
});
