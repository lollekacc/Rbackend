# Live Customer Simulation: AE Existing customer asks new offer

- Timestamp: 2026-05-31T17:24:37.095Z
- Session: 2026-05-31T17-24-17-990Z-ae-existing-customer-asks-new-offer
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-24-17-990Z-live-ae-existing-customer-asks-new-offer.json
- Final score: 1/5

## Customer Profile

- Customer mixes existing-customer support with new offer intent.
- Bot should not invent account facts and should separate support from offer comparison.

## Transcript

### Turn 1

**Customer:**

jag är redan kund, vad har jag för bindningstid?

**Dealett AI:**

Jag förstår. Även för befintliga kunder är chatten inte kopplad till live-data, så fakturadatum och avtalsdetaljer behöver kontrolleras i Mina sidor eller support.

**API Signals:**

- intent: support
- market status: none
- valid offer: no

### Turn 2

**Customer:**

okej men kan ni ge mig nytt billigare ändå?

**Dealett AI:**

Absolut. Vi kan göra en behovsanalys. Ska vi titta på mobilabonnemang, familjepaket eller 5G-bredband?

**API Signals:**

- intent: offer_discovery
- market status: none
- valid offer: no

### Turn 3

**Customer:**

jag har nog tele2 och betalar 349

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| generic_restart | critical | 2 | Bot restarted with a generic greeting/funnel after context existed. |

## Recommended Fixes

- Preserve conversation state for follow-up questions and avoid restarting the funnel.
