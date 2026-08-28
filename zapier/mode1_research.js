// THE QUIET PITCH — MODE 1: NEW PROSPECT RESEARCH
// Paste into a Zapier "Code by Zapier" JavaScript step.

const SYSTEM_PROMPT = `ROLE
You are a client-intelligence agent for Joel / JDB Consults, a business consultant, brand strategist, and CMO working with premium consumer and lifestyle brands globally. You research one prospect, score fit, and draft openers. You never send messages.

STEPS
1. Score R.E.A.C.H. (Relevance, Evidence of pain, Authority, Capacity, Habit) from 0-2 each. If evidence is missing, use null and reason "insufficient data".
2. If total >= 7, choose the single strongest gap: brand & positioning, sales systems (Revenue Loop), executive visibility & personal brand, growth strategy / fractional CMO, or peer network (Fort Business Club).
3. List recent developments visible in the input from the last 90 days. Do not invent.
4. Write a traceable so-what sentence.
5. Draft three openers, each ending in a question mark.
6. Self-QA: remove banned sales-bot phrases, unsupported claims, pitches, CTAs, and generic copy.

Return only valid JSON.`;

const userMessage = [
  `PROSPECT NAME: ${inputData.prospectName || 'unknown'}`,
  `PROFILE TEXT:\n${inputData.profileText || '(none provided)'}`,
  inputData.recentPosts ? `RECENT POSTS:\n${inputData.recentPosts}` : '',
  inputData.websiteNotes ? `WEBSITE NOTES:\n${inputData.websiteNotes}` : '',
  inputData.otherNotes ? `OTHER NOTES:\n${inputData.otherNotes}` : '',
].filter(Boolean).join('\n\n');

const provider = (inputData.provider || 'gemini').toLowerCase();
const apiKey = provider === 'anthropic' ? inputData.anthropicApiKey : inputData.geminiApiKey;

async function callLLM() {
  if (!apiKey) throw new Error(`Missing ${provider} API key`);
  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: inputData.anthropicModel || 'claude-sonnet-4-20250514', max_tokens: 1500, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: userMessage }] }),
    });
    if (!res.ok) throw new Error(`Anthropic API returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return ((data.content || []).find((block) => block.type === 'text') || {}).text || '';
  }
  const model = inputData.geminiModel || 'gemini-2.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ role: 'user', parts: [{ text: userMessage }] }], generationConfig: { maxOutputTokens: 1500, temperature: 0.7, responseMimeType: 'application/json' } }),
  });
  if (!res.ok) throw new Error(`Gemini API returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  if (data.promptFeedback && data.promptFeedback.blockReason) throw new Error(`Gemini blocked prompt: ${data.promptFeedback.blockReason}`);
  const candidate = (data.candidates || [])[0];
  if (!candidate || candidate.finishReason === 'SAFETY') throw new Error('Gemini returned no usable candidate');
  return ((candidate.content || {}).parts || []).map((part) => part.text || '').join('');
}

try {
  const text = await callLLM();
  const dossier = JSON.parse(text.replace(/```json|```/g, '').trim());
  return {
    status: 'Drafted',
    review_status: 'Pending Review',
    provider_used: provider,
    prospect: dossier.prospect || inputData.prospectName || '',
    date: dossier.date || new Date().toISOString().slice(0, 10),
    reach_total: dossier.reach?.total ?? '',
    reach_verdict: dossier.reach?.verdict || '',
    reach_detail: dossier.reach ? JSON.stringify(dossier.reach) : '',
    recent_developments: (dossier.recent_developments || []).join(' | '),
    strongest_gap: dossier.strongest_gap || '',
    so_what: dossier.so_what || '',
    opener_1: (dossier.opener_options || [])[0] || '',
    opener_2: (dossier.opener_options || [])[1] || '',
    opener_3: (dossier.opener_options || [])[2] || '',
    recommended_index: dossier.recommended_index ?? '',
    recommended_reason: dossier.recommended_reason || '',
    next_action: dossier.next_action || '',
    raw_json: JSON.stringify(dossier),
  };
} catch (error) {
  return { status: 'ERROR', error_message: error.message };
}
