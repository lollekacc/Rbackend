# Live Customer Simulation: AC Mixed English campaign binding

- Timestamp: 2026-05-31T17:23:56.234Z
- Session: 2026-05-31T17-23-35-393Z-ac-mixed-english-campaign-binding
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-23-35-393Z-live-ac-mixed-english-campaign-binding.json
- Final score: 1/5

## Customer Profile

- Mixed language with campaign and binding period.
- Bot should ask campaign details and mention binding.

## Transcript

### Turn 1

**Customer:**

i have campaign 149 kr for unlimited with tre

**Dealett AI:**

Om det nuvarande avtalet stämmer är det troligen redan väldigt starkt. Dealett ska inte pressa fram ett byte om totalen inte tydligt blir bättre.

**API Signals:**

- intent: mobile_offer
- market status: probably_not_sellable
- valid offer: no

### Turn 2

**Customer:**

binding left typ 5 months

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

after campaign no idea

**Dealett AI:**

Om det nuvarande avtalet stämmer är det troligen redan väldigt starkt. Dealett ska inte pressa fram ett byte om totalen inte tydligt blir bättre.

**API Signals:**

- intent: mobile_offer
- market status: probably_not_sellable
- valid offer: no

### Turn 4

**Customer:**

can you beat it?

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| missing_campaign_details | critical |  | Bot did not ask campaign length and normal price after campaign. |
| missing_binding_context | critical |  | Bot did not mention binding period before discussing switching. |

## Recommended Fixes

- Campaign-price flow should ask campaign length and normal price after campaign.
- Mention binding period and overlap before discussing immediate switching.
