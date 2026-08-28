# The Quiet Pitch — LinkedIn Client Intelligence System

The agent is designed to do the thinking, not the sending. It qualifies prospects, turns raw research into a dossier, drafts openers, classifies replies, and protects Joel's reputation with hard guardrails.

## Workflow

```text
Discovery via LinkedIn/SalesQL/Clay/exported lists
  -> human glance for obvious bad fits
  -> Mode 1: R.E.A.C.H. dossier + opener drafts
  -> optional contact enrichment from compliant sources
  -> human review and approval
  -> manual or platform-paced send
  -> Mode 2: reply classification + next-touch draft
  -> human review and approval
```

## R.E.A.C.H. qualification

Score each category 0-2. If the evidence is missing, mark it insufficient instead of guessing.

| Letter | Category | Meaning |
| --- | --- | --- |
| R | Relevance | Prospect fits Joel's market, service lines, and ability to buy premium strategy. |
| E | Evidence of pain | The gap is visible in posts, website, hiring, reviews, or recent activity. |
| A | Authority | Prospect owns or influences the decision. |
| C | Capacity | Prospect appears able to invest in premium help. |
| H | Habit | Prospect is active enough that a thoughtful message can land. |

Verdicts: PASS, NURTURE, PURSUE, PRIORITY.

## Gap-to-service map

| Signal | Likely gap | Joel angle |
| --- | --- | --- |
| Inconsistent story, generic about page, scattered voice | Brand & positioning | Positioning strategy and narrative architecture |
| Warm attention but unclear CTA/pricing/packages | Sales systems | Revenue Loop and conversion path |
| Founder invisible while brand is active | Executive visibility | Personal brand and authority system |
| Expansion, funding, hiring, partnerships | Growth strategy | Fractional CMO and operating system |
| Strong founder with thin bench | Peer network | Fort Business Club or leadership sounding board |

## Opener rules

Openers must be specific, true, and low-pressure. They should give before asking, contain no pitch, and end in a genuine question.

Banned phrases:

- I hope this finds you well
- I noticed you
- I help brands like yours
- I came across your profile and was impressed
- circling back
- just following up

## Reply classifications

- INTERESTED: engages with substance or asks a real question.
- LUKEWARM: polite but low-signal.
- OBJECTION: timing, budget, vendor, or fit pushback.
- NOT_NOW: explicitly not a priority without hostility.
- HOSTILE_OPT_OUT: stop/unsubscribe/remove/spam language.

Opt-out is permanent. Do not draft a reply after opt-out.

## Local CLI agent

The repo includes an executable local agent for non-UI use:

```bash
node cli/quiet-pitch-agent.js research examples/prospect.json
node cli/quiet-pitch-agent.js reply examples/reply.json
```

The research mode returns a structured dossier. The reply mode returns classification, draft reply, do-not-contact status, and next action.
