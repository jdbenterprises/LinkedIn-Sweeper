// THE QUIET PITCH — MODE 2: INCOMING REPLY HANDLER
// Paste into a Zapier "Code by Zapier" JavaScript step.

const SYSTEM_PROMPT = `ROLE
You are a reply-handling agent for Joel / JDB Consults. You classify replies and draft the next touch. You never send messages.

Classify as INTERESTED, LUKEWARM, OBJECTION, NOT_NOW, or HOSTILE_OPT_OUT.
HOSTILE_OPT_OUT means do_not_contact true and drafted_reply null.
For all other classes, draft a warm, low-pressure reply without banned sales phrases, pressure, scarcity, or invented claims.
Return only valid JSON with prospect, classification, drafted_reply, do_not_contact, reason, updated_status, next_action.`;

const userMessage = [
  `PROSPECT NAME: ${inputData.prospectName || 'unknown'}`,
  `TOUCH NUMBER: ${inputData.touchNumber || 'unknown'}`,
  `REPLY TEXT:\n${inputData.replyText || ''}`,
  inputData.threadContext ? `THREAD CONTEXT:\n${inputData.threadContext}` : '',
].filter(Boolean).join('\n\n');

const provider = (inputData.provider || 'gemini').toLowerCase();
const apiKey = provider === 'anthropic' ? inputData.anthropicApiKey : inputData.geminiApiKey;

async function callLLM() {
  if (!inputData.replyText) throw new Error('Missing replyText in inputData');
  if (!apiKey) throw new Error(`Missing ${provider} API key`);
  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: inputData.anthropicModel || 'claude-sonnet-4-20250514', max_tokens: 900, system: SYSTEM_PROMPT, messages: [{ role: 'user', content: userMessage }] }),
    });
    if (!res.ok) throw new Error(`Anthropic API returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const data = await res.json();
    return ((data.content || []).find((block) => block.type === 'text') || {}).text || '';
  }
  const model = inputData.geminiModel || 'gemini-2.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ role: 'user', parts: [{ text: userMessage }] }], generationConfig: { maxOutputTokens: 900, temperature: 0.7, responseMimeType: 'application/json' } }),
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
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
  return {
    status: 'Classified',
    provider_used: provider,
    prospect: parsed.prospect || inputData.prospectName || '',
    classification: parsed.classification || '',
    drafted_reply: parsed.drafted_reply || '',
    do_not_contact: parsed.do_not_contact === true,
    review_status: parsed.do_not_contact === true ? 'DO NOT CONTACT' : 'Pending Review',
    reason: parsed.reason || '',
    updated_status: parsed.updated_status || '',
    next_action: parsed.next_action || '',
    raw_json: JSON.stringify(parsed),
  };
} catch (error) {
  return { status: 'ERROR', error_message: error.message };
}
