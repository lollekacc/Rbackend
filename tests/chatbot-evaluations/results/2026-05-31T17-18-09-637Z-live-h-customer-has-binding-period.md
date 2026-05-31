# Live Customer Simulation: H Customer has binding period

- Timestamp: 2026-05-31T17:18:11.191Z
- Session: 2026-05-31T17-18-09-637Z-h-customer-has-binding-period
- API: http://localhost:3100/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-18-09-637Z-live-h-customer-has-binding-period.json
- Final score: 5/5

## Customer Profile

- Customer has binding period until October.
- Bot should not recommend immediate switch without mentioning binding period.

## Transcript

### Turn 1

**Customer:**

jag har bindningstid kvar till oktober

**Dealett AI:**

För att hjälpa dig bättre, kan du berätta när din bindningstid går ut i oktober? Har du också någon specifik mobilanvändning eller behov?

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

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| none | none |  | No automatic issues detected. |

## Recommended Fixes

- No automatic fix required; review tone manually.
