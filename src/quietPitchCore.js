const KILL_PHRASES = [
  'i hope this finds you well',
  'i noticed you',
  'i help brands like yours',
  'i came across your profile and was impressed',
  'circling back',
  'just following up',
];

const GAP_MAP = [
  { key: 'brand & positioning', service: 'Positioning strategy and narrative architecture', terms: ['rebrand', 'positioning', 'voice', 'about', 'unclear', 'generic', 'messaging', 'story'] },
  { key: 'sales systems (Revenue Loop)', service: 'Revenue Loop and conversion path', terms: ['pricing', 'packages', 'cta', 'lead', 'funnel', 'sales', 'conversion', 'demand', 'buying'] },
  { key: 'executive visibility & personal brand', service: 'Executive visibility and authority system', terms: ['founder', 'ceo', 'speaking', 'podcast', 'visibility', 'authority', 'personal brand'] },
  { key: 'growth strategy / fractional CMO', service: 'Fractional CMO and operating-system design', terms: ['expansion', 'funding', 'new market', 'launch', 'partnership', 'growth', 'hiring'] },
  { key: 'peer network (Fort Business Club)', service: 'Peer network and leadership sounding board', terms: ['isolated', 'founder dependency', 'thin bench', 'decision', 'community', 'lonely'] },
];

function asText(value) {
  return Array.isArray(value) ? value.join('\n') : String(value || '');
}

function containsAny(text, terms) {
  const lower = asText(text).toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function verdictFromTotal(total) {
  if (total >= 9) return 'PRIORITY';
  if (total >= 7) return 'PURSUE';
  if (total >= 5) return 'NURTURE';
  return 'PASS';
}

function scoreValue(text, highTerms, mediumTerms = []) {
  if (containsAny(text, highTerms)) return 2;
  if (containsAny(text, mediumTerms)) return 1;
  return null;
}

function reason(score, positive, partial) {
  if (score === 2) return positive;
  if (score === 1) return partial;
  return 'insufficient data';
}

function scoreReach(prospect, operator = {}) {
  const combined = [prospect.profileText, prospect.recentPosts, prospect.websiteNotes, prospect.otherNotes, operator.offer, operator.icp].map(asText).join('\n').toLowerCase();
  const authorityText = `${prospect.role || ''} ${prospect.otherNotes || ''}`;
  const r = scoreValue(combined, ['consumer', 'lifestyle', 'founder', 'ceo', 'brand', 'premium', 'corporate'], ['service business', 'consultant', 'sme', 'startup']);
  const e = scoreValue(combined, ['unclear', 'asked', 'pressure', 'drops', 'hidden', 'no dedicated', 'single-city', 'confusion', 'leaking'], ['rebrand', 'launch', 'hiring', 'expansion']);
  const a = scoreValue(authorityText, ['founder', 'ceo', 'owner', 'owns budget', 'managing partner'], ['lead', 'head', 'director', 'manager']);
  const c = scoreValue(combined, ['premium', 'corporate', 'expansion', 'funding', 'partnership', 'enterprise'], ['startup', 'growing', 'launch']);
  const h = scoreValue(combined, ['posts weekly', 'commenters', 'active', 'shared', 'wrote', 'announced', 'asked followers'], ['posted', 'mentioned']);
  const scored = [r, e, a, c, h].map((value) => value ?? 0);
  const total = scored.reduce((sum, value) => sum + value, 0);

  return {
    r: { score: r, reason: reason(r, 'Strong market/service-line fit for Joel.', 'Adjacent fit, but not a bullseye.') },
    e: { score: e, reason: reason(e, 'The pain is visible in supplied evidence.', 'There is a trigger, but the pain still needs confirmation.') },
    a: { score: a, reason: reason(a, 'Prospect owns or strongly influences the decision.', 'Prospect may influence the decision, but authority is not certain.') },
    c: { score: c, reason: reason(c, 'Commercial motion suggests capacity for premium help.', 'Capacity is plausible but not proven.') },
    h: { score: h, reason: reason(h, 'Visible activity suggests a thoughtful message can land.', 'Some activity exists, but habit is not strongly proven.') },
    total,
    verdict: verdictFromTotal(total),
  };
}

function recentDevelopments(prospect) {
  return asText(prospect.recentPosts)
    .split(/[.\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => containsAny(item, ['announced', 'hiring', 'shared', 'celebrated', 'mentioned', 'asked', 'wrote', 'launched', 'raised', 'expanded']));
}

function strongestGap(prospect) {
  const text = [prospect.profileText, prospect.recentPosts, prospect.websiteNotes, prospect.otherNotes].map(asText).join('\n');
  const scored = GAP_MAP.map((gap) => ({
    ...gap,
    score: gap.terms.reduce((sum, term) => sum + (text.toLowerCase().includes(term) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0] : null;
}


function humanizeDevelopment(development) {
  const item = asText(development).trim();
  if (!item) return 'creating visible market motion';
  return item
    .replace(/^Announced a\s+/i, 'making a public move around a ')
    .replace(/^Announced an\s+/i, 'making a public move around an ')
    .replace(/^Shared that\s+/i, 'showing that ')
    .replace(/^Mentioned\s+/i, 'publicly naming ')
    .replace(/^Asked\s+/i, 'asking about ')
    .replace(/^Wrote that\s+/i, 'publicly wrestling with ')
    .replace(/^Celebrated\s+/i, 'turning ');
}

function soWhat(prospect, gap) {
  if (!gap) return null;
  const developments = recentDevelopments(prospect);
  const doingWell = humanizeDevelopment(developments[0]);
  const leak = gap.key.includes('Revenue') ? 'turning attention into a clear buying path' : gap.key.includes('positioning') ? 'making the public story as sharp as the ambition' : gap.key.includes('CMO') ? 'putting a growth system underneath the momentum' : gap.key.includes('visibility') ? 'turning founder authority into trust before the sales conversation' : 'building a stronger decision-making circle around the founder';
  const timing = developments[0] ? 'the move is already public' : 'the current signals show momentum but not enough system around it';
  return `${prospect.brand || prospect.company || prospect.name} is doing well at ${doingWell.toLowerCase()}, but is quietly leaking value at ${leak}, and the timing is right because ${timing}.`;
}

function selfQaOpener(text) {
  let cleaned = asText(text);
  KILL_PHRASES.forEach((phrase) => {
    cleaned = cleaned.replace(new RegExp(phrase, 'ig'), '').replace(/\s+/g, ' ').trim();
  });
  cleaned = cleaned.replace(/\b(book|schedule|buy|hire me|work with me)\b/ig, '').replace(/\s+/g, ' ').trim();
  return cleaned.endsWith('?') ? cleaned : `${cleaned}?`;
}

function openerOptions(prospect, gap) {
  const firstName = asText(prospect.name).split(' ')[0] || 'there';
  const brand = prospect.brand || prospect.company || 'the brand';
  const trigger = recentDevelopments(prospect)[0] || 'this season you seem to be entering';
  const gapQuestion = gap ? `Is the ${gap.key} piece already being rebuilt, or is it simply next on the list` : 'What is the next strategic constraint';
  return [
    `${firstName}, that ${trigger.toLowerCase()} feels like one of those moments where the outside story has to mature as quickly as the inside ambition. ${gapQuestion}?`,
    `Been studying how ${brand} is showing up lately. The momentum is obvious, but the quiet question is whether the buying journey is carrying the same confidence as the brand. Is that something you are already pressure-testing?`,
    `Random strategic question, but when a brand reaches the kind of season ${brand} seems to be entering, do you usually strengthen the story first or the operating system behind it?`,
  ].map(selfQaOpener);
}

function researchProspect(prospect, operator = {}) {
  const reach = scoreReach(prospect, operator);
  const gap = ['PURSUE', 'PRIORITY'].includes(reach.verdict) ? strongestGap(prospect) : null;
  const openers = gap ? openerOptions(prospect, gap) : [];
  return {
    prospect: prospect.name || 'unknown',
    brand: prospect.brand || prospect.company || '',
    date: operator.date || today(),
    reach,
    recent_developments: recentDevelopments(prospect),
    strongest_gap: gap ? gap.key : null,
    mapped_service: gap ? gap.service : null,
    so_what: soWhat(prospect, gap),
    opener_options: openers,
    recommended_index: openers.length ? 1 : null,
    recommended_reason: openers.length ? 'It names the moment, raises one strategic question, and avoids pitching before trust exists.' : null,
    next_action: reach.total >= 9 ? 'Priority: verify one source manually, then send within 48 hours if approved.' : reach.total >= 7 ? 'Pursue: complete one more research pass before sending.' : reach.total >= 5 ? 'Nurture: wait for a sharper trigger.' : 'Pass for now.',
    review_status: 'Pending Review',
  };
}

function classifyReply(replyText) {
  const text = asText(replyText).toLowerCase();
  if (containsAny(text, ['stop', 'unsubscribe', 'do not contact', 'remove me', 'spam', 'never message'])) return 'HOSTILE_OPT_OUT';
  if (containsAny(text, ['not a priority', 'not now', 'later', 'next quarter', 'not interested'])) return 'NOT_NOW';
  if (containsAny(text, ['already have', 'too expensive', 'no budget', 'timing', 'consultant', 'agency'])) return 'OBJECTION';
  if (containsAny(text, ['what would', 'how would', 'tell me', 'interested', 'send', 'explain', '?'])) return 'INTERESTED';
  return 'LUKEWARM';
}

function handleReply({ prospect = {}, replyText = '', touchNumber = 2, threadContext = '' }) {
  const classification = classifyReply(replyText);
  const firstName = asText(prospect.name).split(' ')[0] || 'there';
  const brand = prospect.brand || prospect.company || 'the brand';
  if (classification === 'HOSTILE_OPT_OUT') {
    return { prospect: prospect.name || '', classification, drafted_reply: null, do_not_contact: true, reason: 'The reply contains opt-out or hostile language.', updated_status: 'DO NOT CONTACT', next_action: 'Stop all outreach permanently.' };
  }
  const bridgeAllowed = Number(touchNumber) >= 4 || containsAny(threadContext, ['touch 3', 'shared value', 'asked for more']);
  const drafts = {
    INTERESTED: `${firstName}, the first thing I would pressure-test is whether the strongest promise is obvious before someone has to work for it. If the offer is already good, the leak is usually not quality — it is sequencing. What part of the current journey are people reacting to most?`,
    LUKEWARM: `${firstName}, appreciate you reading it. Quick one — when you look at ${brand} from the inside, does the bigger constraint feel like demand, clarity, or execution?`,
    OBJECTION: `${firstName}, that makes sense — if someone is already close to the work, I would not suggest disrupting that. The only useful angle may be a second set of eyes on the specific blindspot, no worries either way. Is that already covered by the current support?`,
    NOT_NOW: `${firstName}, completely fair. I would rather the timing be honest than forced. Should I leave this until there is a clearer trigger on your side?`,
  };
  const reply = bridgeAllowed && classification === 'INTERESTED'
    ? `${drafts.INTERESTED} Funny enough, I worked through a similar pattern with a founder-led brand recently — would seeing the thinking pattern be useful?`
    : drafts[classification];
  return { prospect: prospect.name || '', classification, drafted_reply: selfQaOpener(reply), do_not_contact: false, reason: 'Classified from explicit language and engagement level.', updated_status: `Replied-${classification}`, next_action: 'Review manually before sending.' };
}

module.exports = {
  GAP_MAP,
  KILL_PHRASES,
  classifyReply,
  handleReply,
  researchProspect,
  scoreReach,
  selfQaOpener,
  strongestGap,
};
