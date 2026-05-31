# Live Customer Simulation: D Campaign confusion

- Timestamp: 2026-05-31T17:23:35.473Z
- Session: 2026-05-31T17-23-35-393Z-d-campaign-confusion
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-23-35-393Z-live-d-campaign-confusion.json
- Final score: 1/5

## Customer Profile

- Customer gives a low campaign-like price.
- Bot should ask campaign length and normal price after campaign.

## Transcript

### Turn 1

**Customer:**

jag betalar 199 kr för 50 gb

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: realistic
- valid offer: no

### Turn 2

**Customer:**

men det kanske bara gäller några månader

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

jag vet inte vad priset blir sen

**Dealett AI:**

Ingen fara. Vi börjar enkelt: gäller det ett abonnemang eller flera?

**API Signals:**

- intent: mobile_offer
- market status: realistic
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| missing_campaign_details | critical |  | Bot did not ask campaign length and normal price after campaign. |

## Recommended Fixes

- Campaign-price flow should ask campaign length and normal price after campaign.
