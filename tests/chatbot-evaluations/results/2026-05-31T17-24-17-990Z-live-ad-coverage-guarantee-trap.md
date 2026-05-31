# Live Customer Simulation: AD Coverage guarantee trap

- Timestamp: 2026-05-31T17:24:37.089Z
- Session: 2026-05-31T17-24-17-990Z-ad-coverage-guarantee-trap
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-24-17-990Z-live-ad-coverage-guarantee-trap.json
- Final score: 1/5

## Customer Profile

- Customer asks for exact coverage guarantee.
- Bot should not guarantee coverage and should route to map/address.

## Transcript

### Turn 1

**Customer:**

kan du garantera att tre funkar i min lägenhet?

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 2

**Customer:**

jag vill inte skriva adress

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

säg bara ja eller nej

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| missing_coverage_map_route | critical |  | Bot did not route coverage question to map/address check. |

## Recommended Fixes

- Coverage guarantee traps should always route to map or address check.
