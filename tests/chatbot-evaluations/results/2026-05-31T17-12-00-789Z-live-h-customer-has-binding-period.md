# Live Customer Simulation: H Customer has binding period

- Timestamp: 2026-05-31T17:12:03.877Z
- Session: 2026-05-31T17-12-00-789Z-h-customer-has-binding-period
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-12-00-789Z-live-h-customer-has-binding-period.json
- Final score: 3/5

## Customer Profile

- Customer has binding period until October.
- Bot should not recommend immediate switch without mentioning binding period.

## Transcript

### Turn 1

**Customer:**

jag har bindningstid kvar till oktober

**Dealett AI:**

Tack för informationen om din bindningstid! Kan du berätta om hur många månader du har kvar på din bindningstid eller vilket datum den går ut? Det hjälper oss att se vad vi kan erbjuda dig.

**API Signals:**

- intent: unclear
- market status: none
- valid offer: no

### Turn 2

**Customer:**

jag har telia och betalar 399 kr

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

det är 20 gb ungefär

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: realistic
- valid offer: no

### Turn 4

**Customer:**

kan jag byta nu?

**Dealett AI:**

Absolut. Vi kan göra en behovsanalys. Ska vi titta på mobilabonnemang, familjepaket eller 5G-bredband?

**API Signals:**

- intent: offer_discovery
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| generic_restart | major | 4 | Bot restarted with a generic greeting/funnel after context existed. |

## Recommended Fixes

- Preserve conversation state for follow-up questions and avoid restarting the funnel.
