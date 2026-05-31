# Live Customer Simulation: K Slang misspelled expensive plan

- Timestamp: 2026-05-31T17:24:23.074Z
- Session: 2026-05-31T17-24-17-990Z-k-slang-misspelled-expensive-plan
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-24-17-990Z-live-k-slang-misspelled-expensive-plan.json
- Final score: 1/5

## Customer Profile

- Customer uses slang and misspellings.
- Bot should understand mobile-plan intent and ask one practical next question.

## Transcript

### Turn 1

**Customer:**

tjaa mitt abbonemang e svindyrt asså

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 2

**Customer:**

har typ tele 2 tror ja

**Dealett AI:**

För att hjälpa dig bättre, kan du berätta om hur många abonnemang du har och vilket typ av mobilanvändning du har? Vill du kolla om det finns billigare alternativ?

**API Signals:**

- intent: unclear
- market status: none
- valid offer: no

### Turn 3

**Customer:**

betalar 4 hundra nånting

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 4

**Customer:**

vill ba ha billigare

**Dealett AI:**

Absolut. Vi kan göra en behovsanalys. Ska vi titta på mobilabonnemang, familjepaket eller 5G-bredband?

**API Signals:**

- intent: offer_discovery
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| generic_restart | critical | 4 | Bot restarted with a generic greeting/funnel after context existed. |
| not_minimal_for_cheapest_customer | critical |  | Bot asked too much at once for a cheapest-only customer. |

## Recommended Fixes

- Preserve conversation state for follow-up questions and avoid restarting the funnel.
- For cheapest-only customers, ask one minimal required question at a time.
