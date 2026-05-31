# Live Customer Simulation: U Binding plus campaign price

- Timestamp: 2026-05-31T17:23:53.103Z
- Session: 2026-05-31T17-23-35-393Z-u-binding-plus-campaign-price
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-23-35-393Z-live-u-binding-plus-campaign-price.json
- Final score: 1/5

## Customer Profile

- Customer has binding period and campaign price.
- Bot must mention binding and ask campaign details before recommending.

## Transcript

### Turn 1

**Customer:**

jag har kampanj 199 kr men bindningstid till december

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 2

**Customer:**

50 gb tror jag

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: realistic
- valid offer: no

### Turn 3

**Customer:**

telia

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 4

**Customer:**

kan jag byta ändå?

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
| missing_campaign_details | critical |  | Bot did not ask campaign length and normal price after campaign. |
| missing_binding_context | critical |  | Bot did not mention binding period before discussing switching. |

## Recommended Fixes

- Preserve conversation state for follow-up questions and avoid restarting the funnel.
- Campaign-price flow should ask campaign length and normal price after campaign.
- Mention binding period and overlap before discussing immediate switching.
