# Live Customer Simulation: Q Household total without people count

- Timestamp: 2026-05-31T17:23:46.631Z
- Session: 2026-05-31T17-23-35-393Z-q-household-total-without-people-count
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-23-35-393Z-live-q-household-total-without-people-count.json
- Final score: 1/5

## Customer Profile

- Customer gives total household price but not number of people.
- Bot must ask how many subscriptions before calculating per person.

## Transcript

### Turn 1

**Customer:**

vi betalar 699 totalt hemma

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 2

**Customer:**

det är mobilabonnemang

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

kan ni göra billigare?

**Dealett AI:**

Absolut. Vi kan göra en behovsanalys. Ska vi titta på mobilabonnemang, familjepaket eller 5G-bredband?

**API Signals:**

- intent: offer_discovery
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| generic_restart | critical | 3 | Bot restarted with a generic greeting/funnel after context existed. |

## Recommended Fixes

- Preserve conversation state for follow-up questions and avoid restarting the funnel.
