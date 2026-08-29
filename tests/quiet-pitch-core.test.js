const assert = require('assert');
const { handleReply, researchProspect, selfQaOpener } = require('../src/quietPitchCore');

const prospect = {
  name: 'Mira Bello',
  brand: 'Studio Nola',
  role: 'CEO',
  profileText: 'Founder-led lifestyle studio repositioning for corporate wellness buyers. CEO posts weekly.',
  recentPosts: 'Announced a rebrand. Shared that prospects keep asking about packages and pricing.',
  websiteNotes: 'Beautiful visuals, unclear buying path, soft CTA hidden below the fold.',
};

const dossier = researchProspect(prospect, { offer: 'Premium strategy and revenue loops', icp: 'Lifestyle brands' });
assert.strictEqual(dossier.reach.verdict, 'PRIORITY');
assert.ok(dossier.strongest_gap);
assert.strictEqual(dossier.opener_options.length, 3);
assert.ok(dossier.opener_options.every((opener) => opener.endsWith('?')));

const optOut = handleReply({ prospect, replyText: 'Please stop messaging me.' });
assert.strictEqual(optOut.classification, 'HOSTILE_OPT_OUT');
assert.strictEqual(optOut.do_not_contact, true);
assert.strictEqual(optOut.drafted_reply, null);

const interested = handleReply({ prospect, replyText: 'What would you change first?', touchNumber: 2 });
assert.strictEqual(interested.classification, 'INTERESTED');
assert.ok(interested.drafted_reply.endsWith('?'));

const cleaned = selfQaOpener('I hope this finds you well. I help brands like yours book a call');
assert.ok(!/i hope this finds you well|i help brands like yours|book/i.test(cleaned));
assert.ok(cleaned.endsWith('?'));

console.log('Quiet Pitch core tests passed');
