# Live Customer Simulation: AI Wrong math challenge

- Timestamp: 2026-05-31T17:23:58.799Z
- Session: 2026-05-31T17-23-35-393Z-ai-wrong-math-challenge
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-23-35-393Z-live-ai-wrong-math-challenge.json
- Final score: 1/5

## Customer Profile

- Customer challenges the math.
- Bot should explain calculation or ask for exact missing values, not bluff.

## Transcript

### Turn 1

**Customer:**

ni säger billigare men ni räknar fel

**Dealett AI:**

Absolut. Vi kan göra en behovsanalys. Ska vi titta på mobilabonnemang, familjepaket eller 5G-bredband?

**API Signals:**

- intent: offer_discovery
- market status: none
- valid offer: no

### Turn 2

**Customer:**

jag betalar 299 och har 3 månader kvar

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

hur räknar du dubbelkostnaden?

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| missing_calculation_explanation | critical |  | Bot did not explain calculation or ask for facts when math was challenged. |

## Recommended Fixes

- Explain overlap cost, current cost, gift card and missing facts when customers challenge the math.
