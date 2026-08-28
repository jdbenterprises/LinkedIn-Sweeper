const prospects = [
  {
    name: 'Adaeze Nwokolo',
    role: 'Founder',
    company: 'Afiari Foods',
    website: 'afiari.example',
    email: 'adaeze@afiari.example',
    posts: ['Announced expansion into Abuja and Port Harcourt.', 'Asked followers for distributor recommendations.', 'Shared behind-the-scenes team stress during launch week.'],
    signals: ['expansion', 'distribution', 'team pressure', 'weak homepage narrative'],
    recentProject: 'Two-city retail expansion',
  },
  {
    name: 'Tomiwa Briggs',
    role: 'People Lead',
    company: 'OrbitPay',
    website: 'orbitpay.example',
    email: 'tomiwa@orbitpay.example',
    posts: ['Hiring team leads across product and operations.', 'Wrote about speed dropping as the company grows.', 'Celebrated a new compliance partnership.'],
    signals: ['hiring', 'execution drag', 'leadership layer', 'systems gap'],
    recentProject: 'Middle-management buildout',
  },
  {
    name: 'Mira Bello',
    role: 'CEO',
    company: 'Studio Nola',
    website: 'studionola.example',
    email: 'mira@studionola.example',
    posts: ['Showed a rebrand with strong comment engagement.', 'Prospects asked for pricing and packages in comments.', 'Mentioned wanting corporate clients next quarter.'],
    signals: ['rebrand', 'offer confusion', 'warm demand', 'B2B repositioning'],
    recentProject: 'Corporate offer repositioning',
  },
  {
    name: 'Chidera Okafor',
    role: 'Managing Partner',
    company: 'LearnForge Africa',
    website: 'learnforge.example',
    email: 'chidera@learnforge.example',
    posts: ['Posted workshop photos from three banks.', 'Said the team is documenting delivery processes.', 'Asked which industries need leadership training most.'],
    signals: ['training demand', 'process documentation', 'enterprise credibility', 'positioning gap'],
    recentProject: 'Enterprise training scale-up',
  },
];

const toneTemplates = {
  bigBrother: {
    greeting: 'I may be overstepping slightly, but I noticed something worth protecting before it becomes expensive.',
    close: 'No pressure at all — I just thought it was worth mentioning because the opportunity is already visible.',
  },
  peer: {
    greeting: 'I noticed a strategic opening in what you are building and thought to share it plainly.',
    close: 'If useful, I would be happy to exchange notes and share a sharper version of the thought.',
  },
  advisor: {
    greeting: 'A small observation from the outside: there appears to be a useful next move available to your team.',
    close: 'If this is already on your radar, beautiful. If not, it may be worth a short conversation.',
  },
};

function scoreProspect(prospect, offer, icp) {
  const text = `${prospect.signals.join(' ')} ${prospect.posts.join(' ')} ${offer} ${icp}`.toLowerCase();
  const weights = {
    expansion: 14, hiring: 12, leadership: 11, systems: 12, rebrand: 9, training: 10,
    positioning: 10, demand: 8, revenue: 8, founder: 7, corporate: 7, process: 8,
  };
  return Math.min(98, 58 + Object.entries(weights).reduce((sum, [word, value]) => sum + (text.includes(word) ? value : 0), 0));
}

function diagnoseGap(prospect) {
  if (prospect.signals.includes('expansion')) return 'Growth story is not yet converted into a scalable trust, distributor, and sales narrative.';
  if (prospect.signals.includes('execution drag')) return 'The leadership layer may be forming after the pressure has already arrived, which can create avoidable operational drag.';
  if (prospect.signals.includes('offer confusion')) return 'Attention is present, but buying clarity is leaking in the comments before prospects reach a structured offer.';
  return 'The company has market proof, but the internal delivery system and external positioning need to mature together.';
}

function suggestJoelOffer(prospect) {
  if (prospect.signals.includes('training demand')) return 'Enterprise training productisation, facilitator operating system, and authority-led B2B positioning.';
  if (prospect.signals.includes('hiring')) return 'Leadership operating rhythm, manager enablement workshop, and founder-dependency reduction sprint.';
  if (prospect.signals.includes('rebrand')) return 'Offer clarity audit, premium positioning sprint, and conversion-message architecture.';
  return 'Strategic growth audit, market narrative refinement, and execution-system design.';
}

function draftMessage(prospect, tone) {
  const template = toneTemplates[tone];
  const gap = diagnoseGap(prospect);
  const offer = suggestJoelOffer(prospect);
  return `Hi ${prospect.name.split(' ')[0]} — ${template.greeting}\n\nI saw the signals around ${prospect.recentProject.toLowerCase()} at ${prospect.company}. What stood out is not a lack of momentum; it is that the momentum may be moving faster than the positioning and internal systems around it.\n\nThe blindspot I would watch: ${gap}\n\nA practical fix could be a short ${offer.toLowerCase()} so the growth you are already creating becomes easier to trust, explain, and execute.\n\n${template.close}`;
}

function render() {
  const offer = document.querySelector('#offer').value;
  const icp = document.querySelector('#icp').value;
  const tone = document.querySelector('#toneSelect').value;
  const ranked = prospects.map((prospect) => ({ ...prospect, score: scoreProspect(prospect, offer, icp), gap: diagnoseGap(prospect), offer: suggestJoelOffer(prospect), message: draftMessage(prospect, tone) })).sort((a, b) => b.score - a.score);

  document.querySelector('#leadCount').textContent = ranked.length;
  document.querySelector('#avgFit').textContent = `${Math.round(ranked.reduce((sum, prospect) => sum + prospect.score, 0) / ranked.length)}%`;
  document.querySelector('#draftCount').textContent = ranked.length;

  document.querySelector('#reasoningLog').innerHTML = [
    'Parsed Joel’s offer and ICP for strategy, leadership, systems, brand, training, and growth signals.',
    'Scanned mock LinkedIn/SalesQL-style records for expansion, hiring, rebrand, demand, and operational-pressure triggers.',
    'Ranked prospects by visible urgency, Joel-fit, likely budget relevance, and message specificity.',
    'Generated dossiers with public-style signals, hypothesised gaps, suggested Joel offer, and human-review outreach drafts.',
  ].map((item) => `<li>${item}</li>`).join('');

  document.querySelector('#prospectBoard').innerHTML = ranked.map((prospect, index) => `
    <article class="prospectCard">
      <div class="cardTop"><span>#${index + 1}</span><strong>${prospect.score}% fit</strong></div>
      <h3>${prospect.name}</h3>
      <p class="muted">${prospect.role}, ${prospect.company}</p>
      <dl>
        <dt>Email</dt><dd>${prospect.email}</dd>
        <dt>Website</dt><dd>${prospect.website}</dd>
        <dt>Recent project</dt><dd>${prospect.recentProject}</dd>
      </dl>
      <h4>Research signals</h4>
      <ul>${prospect.posts.map((post) => `<li>${post}</li>`).join('')}</ul>
      <h4>Market gap Joel can fill</h4>
      <p>${prospect.gap}</p>
      <h4>Recommended offer angle</h4>
      <p>${prospect.offer}</p>
      <button data-message="${index}">Load message draft</button>
    </article>
  `).join('');

  const first = ranked[0];
  document.querySelector('#messageOutput').innerHTML = `<pre>${first.message}</pre>`;

  document.querySelectorAll('[data-message]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = ranked[Number(button.dataset.message)];
      document.querySelector('#messageOutput').innerHTML = `<pre>${selected.message}</pre>`;
      document.querySelector('#messages').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

document.querySelector('#prospectForm').addEventListener('submit', (event) => { event.preventDefault(); render(); });
document.querySelector('#rerunBtn').addEventListener('click', render);
document.querySelector('#toneSelect').addEventListener('change', render);
render();
