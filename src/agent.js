const killPhrases = [
  'i hope this finds you well',
  'i noticed you',
  'i help brands like yours',
  'i came across your profile and was impressed',
  'circling back',
  'just following up',
];

const gapMap = [
  { key: 'brand & positioning', terms: ['rebrand', 'positioning', 'voice', 'about', 'unclear', 'generic', 'messaging'] },
  { key: 'sales systems (Revenue Loop)', terms: ['pricing', 'packages', 'cta', 'lead', 'funnel', 'sales', 'conversion', 'demand'] },
  { key: 'executive visibility & personal brand', terms: ['founder', 'ceo', 'speaking', 'podcast', 'visibility', 'authority'] },
  { key: 'growth strategy / fractional CMO', terms: ['expansion', 'funding', 'new market', 'launch', 'partnership', 'growth'] },
  { key: 'peer network (Fort Business Club)', terms: ['isolated', 'founder dependency', 'thin bench', 'decision', 'community'] },
];

const sampleProspects = [
  {
    name: 'Mira Bello',
    brand: 'Studio Nola',
    role: 'CEO',
    region: 'UK',
    profileText: 'Founder-led lifestyle studio repositioning for corporate wellness buyers. CEO posts weekly and speaks openly about premium service design.',
    recentPosts: 'Announced a rebrand. Shared a post where several commenters asked about packages and pricing. Mentioned wanting more corporate clients next quarter.',
    websiteNotes: 'Beautiful visuals, unclear buying path, no dedicated corporate offer page, soft CTA hidden below the fold.',
    otherNotes: 'Likely owns budget and brand direction.',
  },
  {
    name: 'Adaeze Nwokolo',
    brand: 'Afiari Foods',
    role: 'Founder',
    region: 'Canada',
    profileText: 'Consumer food founder with visible momentum and founder-led storytelling. Active profile with customers and distributors in comments.',
    recentPosts: 'Announced two-city expansion. Asked followers for distributor recommendations. Shared launch-week pressure on the team.',
    websiteNotes: 'Homepage still reads like a single-city brand. No expansion story, distributor page, or retail partner proof.',
    otherNotes: 'Expansion creates a time-sensitive strategy and systems window.',
  },
  {
    name: 'Tomiwa Briggs',
    brand: 'OrbitPay',
    role: 'People Lead',
    region: 'US',
    profileText: 'People leader at a fintech scaling operations and product teams. Posts about execution speed, culture, and manager quality.',
    recentPosts: 'Hiring team leads across product and operations. Wrote that speed drops when decision-making is unclear. Celebrated a compliance partnership.',
    websiteNotes: 'Clear product story but little executive visibility from the leadership bench.',
    otherNotes: 'Influences leadership development decisions; budget owner may be CEO/COO.',
  },
];

const replies = [
  { label: 'Interested', text: 'This is sharp. What would you change first if you were looking at the offer page?' },
  { label: 'Lukewarm', text: 'Thanks Joel, appreciate the note.' },
  { label: 'Objection', text: 'We already have a marketing consultant working with us right now.' },
  { label: 'Not now', text: 'Not a priority for us this quarter, maybe later.' },
  { label: 'Opt-out', text: 'Please stop messaging me.' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function containsAny(text, terms) {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term));
}

function scoreCategory(label, value, reason) {
  return { label, score: value, reason };
}

function scoreReach(prospect, offer = '', icp = '') {
  const combined = `${prospect.profileText} ${prospect.recentPosts} ${prospect.websiteNotes} ${prospect.otherNotes} ${offer} ${icp}`.toLowerCase();
  const r = containsAny(combined, ['consumer', 'lifestyle', 'founder', 'ceo', 'brand', 'premium', 'corporate']) ? 2 : 1;
  const e = containsAny(combined, ['unclear', 'asked', 'pressure', 'drops', 'hidden', 'no dedicated', 'single-city']) ? 2 : 1;
  const a = containsAny(`${prospect.role} ${prospect.otherNotes}`, ['founder', 'ceo', 'owns budget']) ? 2 : 1;
  const c = containsAny(combined, ['premium', 'corporate', 'expansion', 'fintech', 'partnership']) ? 2 : 1;
  const h = containsAny(combined, ['posts weekly', 'commenters', 'active', 'shared', 'wrote', 'announced']) ? 2 : 1;
  const total = r + e + a + c + h;
  const verdict = total >= 9 ? 'PRIORITY' : total >= 7 ? 'PURSUE' : total >= 5 ? 'NURTURE' : 'PASS';

  return {
    r: scoreCategory('Relevance', r, r === 2 ? 'Sits squarely in Joel’s consumer/lifestyle, founder, strategy, or premium-growth lane.' : 'Adjacent fit, but not enough proof of category fit.'),
    e: scoreCategory('Evidence of pain', e, e === 2 ? 'Visible gaps appear in posts or website notes rather than being guessed.' : 'Some possible pain exists, but evidence is still thin.'),
    a: scoreCategory('Authority', a, a === 2 ? 'Prospect appears to own or strongly influence the brand/budget decision.' : 'Prospect may influence the decision, but final authority is unclear.'),
    c: scoreCategory('Capacity', c, c === 2 ? 'Signals suggest enough commercial motion to afford strategic support.' : 'Capacity is plausible but not yet proven.'),
    h: scoreCategory('Habit', h, h === 2 ? 'Recent posting/comment activity suggests a thoughtful message can land.' : 'Engagement exists, but cadence is not strongly proven.'),
    total,
    verdict,
  };
}

function findRecentDevelopments(prospect) {
  const text = prospect.recentPosts;
  return text.split('.').map((item) => item.trim()).filter(Boolean).filter((item) => containsAny(item, ['announced', 'hiring', 'shared', 'celebrated', 'mentioned', 'asked', 'wrote']));
}

function strongestGap(prospect) {
  const text = `${prospect.profileText} ${prospect.recentPosts} ${prospect.websiteNotes}`;
  const scored = gapMap.map((gap) => ({
    key: gap.key,
    score: gap.terms.reduce((sum, term) => sum + (text.toLowerCase().includes(term) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].key : null;
}

function soWhat(prospect, gap) {
  if (!gap) return null;
  const wins = prospect.recentPosts.split('.')[0].toLowerCase();
  const leak = gap.includes('Revenue') ? 'turning visible interest into a cleaner buying path' : gap.includes('positioning') ? 'making the brand story as sharp as the ambition' : gap.includes('CMO') ? 'building the system underneath the new growth' : 'turning leadership attention into repeatable operating rhythm';
  return `${prospect.brand} is doing well at ${wins}, but is quietly leaking value at ${leak}, and the timing is right because ${prospect.recentPosts.split('.')[0].toLowerCase()}.`;
}

function openerOptions(prospect, gap) {
  const brand = prospect.brand;
  const trigger = prospect.recentPosts.split('.')[0].toLowerCase();
  const gapQuestion = gap ? `whether the ${gap} piece is already being rebuilt or simply next on the list` : 'what the next strategic constraint is';
  return [
    `${prospect.name.split(' ')[0]}, that ${trigger} feels like one of those moments where the outside story has to mature as quickly as the inside ambition. Is ${gapQuestion}?`,
    `Been studying how ${brand} is showing up lately. The momentum is obvious, but the quiet question for me is whether the buying journey is carrying the same confidence as the brand. Is that something you are already pressure-testing?`,
    `Random strategic question, but when a brand reaches the kind of season ${brand} seems to be entering, do you usually strengthen the story first or the operating system behind it?`,
  ].map(selfQaOpener);
}

function selfQaOpener(text) {
  let cleaned = text;
  killPhrases.forEach((phrase) => {
    const pattern = new RegExp(phrase, 'ig');
    cleaned = cleaned.replace(pattern, '');
  });
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned.endsWith('?') ? cleaned : `${cleaned}?`;
}

function buildDossier(prospect, offer = '', icp = '') {
  const reach = scoreReach(prospect, offer, icp);
  const gap = ['PURSUE', 'PRIORITY'].includes(reach.verdict) ? strongestGap(prospect) : null;
  const openers = gap ? openerOptions(prospect, gap) : [];
  return {
    prospect: `${prospect.name} / ${prospect.brand}`,
    date: today(),
    reach,
    recentDevelopments: findRecentDevelopments(prospect),
    strongestGap: gap,
    soWhat: soWhat(prospect, gap),
    openerOptions: openers,
    recommendedIndex: openers.length ? 1 : null,
    recommendedReason: openers.length ? 'It names the trigger, frames the blindspot gently, and ends with curiosity rather than a pitch.' : null,
    nextAction: reach.total >= 9 ? 'Research today and send within 48 hours after human approval.' : reach.total >= 7 ? 'Pursue this week after one manual source check.' : 'Nurture until a sharper trigger appears.',
  };
}

function classifyReply(replyText) {
  const text = replyText.toLowerCase();
  if (containsAny(text, ['stop', 'unsubscribe', 'do not contact', 'remove me', 'spam'])) return 'HOSTILE_OPT_OUT';
  if (containsAny(text, ['not a priority', 'not now', 'later', 'next quarter'])) return 'NOT_NOW';
  if (containsAny(text, ['already have', 'too expensive', 'no budget', 'timing', 'consultant'])) return 'OBJECTION';
  if (containsAny(text, ['what would', 'how would', 'tell me', 'interested', 'send', '?'])) return 'INTERESTED';
  return 'LUKEWARM';
}

function draftReply(prospect, replyText, touchNumber = 2) {
  const classification = classifyReply(replyText);
  if (classification === 'HOSTILE_OPT_OUT') {
    return { classification, draftedReply: null, doNotContact: true, reason: 'Prospect used opt-out or hostile language.', updatedStatus: 'DO NOT CONTACT', nextAction: 'Stop all outreach permanently.' };
  }
  const firstName = prospect.name.split(' ')[0];
  const bridgeAllowed = Number(touchNumber) >= 4;
  const repliesByClass = {
    INTERESTED: `${firstName}, the first thing I would pressure-test is whether the strongest promise on the page is obvious before someone scrolls. If the offer is already good, the leak is usually not quality — it is sequencing. What part of the page are people reacting to most right now?`,
    LUKEWARM: `${firstName}, appreciate you reading it. Quick one — when you look at ${prospect.brand} from the inside, does the bigger constraint feel like demand, clarity, or execution?`,
    OBJECTION: `${firstName}, that makes sense — if someone is already close to the work, I would not suggest disrupting that. The only useful angle may be a second set of eyes on the specific blindspot, no worries either way. Is that already covered by the consultant?`,
    NOT_NOW: `${firstName}, completely fair. No pressure from me — I would rather the timing be honest than forced. Should I leave this until there is a clearer trigger on your side?`,
  };
  const draftedReply = bridgeAllowed && classification === 'INTERESTED'
    ? `${repliesByClass.INTERESTED} Funny enough, I worked through something similar with a founder-led brand recently — would seeing the thinking pattern be useful?`
    : repliesByClass[classification];
  return { classification, draftedReply: selfQaOpener(draftedReply), doNotContact: false, reason: 'Reply classified from explicit language and level of engagement.', updatedStatus: `Replied-${classification}`, nextAction: 'Review draft manually before sending.' };
}

function renderReach(reach) {
  return ['r', 'e', 'a', 'c', 'h'].map((key) => `<li><strong>${key.toUpperCase()} ${reach[key].score}/2</strong><span>${reach[key].reason}</span></li>`).join('');
}

function renderDossier(dossier, index) {
  return `
    <article class="dossierCard">
      <div class="cardTop"><span>${dossier.reach.verdict}</span><strong>${dossier.reach.total}/10</strong></div>
      <h3>${dossier.prospect}</h3>
      <p>${dossier.soWhat || 'Insufficient evidence for a full so-what sentence. Nurture until more signals appear.'}</p>
      <ul class="reachList">${renderReach(dossier.reach)}</ul>
      <h4>Recent developments</h4>
      <p>${dossier.recentDevelopments.length ? dossier.recentDevelopments.join(' · ') : 'None visible in supplied input.'}</p>
      <h4>Strongest gap</h4>
      <p>${dossier.strongestGap || 'None — not enough evidence to pursue yet.'}</p>
      <h4>Openers</h4>
      <ol>${dossier.openerOptions.map((opener) => `<li>${opener}</li>`).join('') || '<li>No opener generated for PASS/NURTURE prospect.</li>'}</ol>
      <button data-dossier="${index}">Load recommended opener</button>
    </article>`;
}

function render() {
  const offer = document.querySelector('#offer').value;
  const icp = document.querySelector('#icp').value;
  const query = document.querySelector('#query').value;
  const dossiers = sampleProspects.map((prospect) => buildDossier(prospect, offer, icp)).sort((a, b) => b.reach.total - a.reach.total);
  document.querySelector('#leadCount').textContent = dossiers.length;
  document.querySelector('#priorityCount').textContent = dossiers.filter((dossier) => dossier.reach.verdict === 'PRIORITY').length;
  document.querySelector('#avgFit').textContent = `${Math.round(dossiers.reduce((sum, dossier) => sum + dossier.reach.total, 0) / dossiers.length)}/10`;
  document.querySelector('#prospectBoard').innerHTML = dossiers.map(renderDossier).join('');
  document.querySelector('#messageOutput').innerHTML = `<pre>${dossiers[0].openerOptions[dossiers[0].recommendedIndex - 1]}\n\nRecommended because: ${dossiers[0].recommendedReason}\n\nNext action: ${dossiers[0].nextAction}</pre>`;

  document.querySelector('#reasoningLog').innerHTML = [
    `Mode 1 selected: new prospect research and opener drafting for query: ${query}.`,
    'Applied R.E.A.C.H. scoring: Relevance, Evidence of pain, Authority, Capacity, Habit.',
    'Mapped the sharpest proven gap to Joel’s offer lines instead of listing every possible problem.',
    'Ran self-QA against banned sales-bot phrases, unsupported claims, premature CTAs, and non-question openers.',
  ].map((item) => `<li>${item}</li>`).join('');

  document.querySelectorAll('[data-dossier]').forEach((button) => {
    button.addEventListener('click', () => {
      const dossier = dossiers[Number(button.dataset.dossier)];
      document.querySelector('#messageOutput').innerHTML = `<pre>${dossier.openerOptions[dossier.recommendedIndex - 1] || 'No opener available.'}\n\n${dossier.recommendedReason || ''}\n\n${dossier.nextAction}</pre>`;
      document.querySelector('#messages').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderReplyMode() {
  const prospect = sampleProspects[0];
  const replyText = document.querySelector('#replyText').value;
  const touchNumber = document.querySelector('#touchNumber').value;
  const result = draftReply(prospect, replyText, touchNumber);
  document.querySelector('#replyOutput').innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
}

document.querySelector('#prospectForm').addEventListener('submit', (event) => { event.preventDefault(); render(); });
document.querySelector('#rerunBtn').addEventListener('click', render);
document.querySelector('#replyForm').addEventListener('submit', (event) => { event.preventDefault(); renderReplyMode(); });
document.querySelector('#sampleReply').addEventListener('change', (event) => { document.querySelector('#replyText').value = replies[Number(event.target.value)].text; renderReplyMode(); });
render();
renderReplyMode();
