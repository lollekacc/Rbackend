# Live Customer Simulation: B Strong family bundle

- Timestamp: 2026-05-31T17:14:55.282Z
- Session: 2026-05-31T17-14-55-210Z-b-strong-family-bundle
- API: http://localhost:3100/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-14-55-210Z-live-b-strong-family-bundle.json
- Final score: 3/5

## Customer Profile

- 5 people on Tele2 family.
- Customer thinks total cost is about 899 kr.
- Bot should roughly understand per-person price and avoid forcing a switch.

## Transcript

### Turn 1

**Customer:**

vi är 5 personer och har tele2 familj

**Dealett AI:**

Hur lång bindningstid har varje abonnemang kvar? Du kan svara en i taget, eller till exempel "3 månader på alla".

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 2

**Customer:**

tror vi betalar typ 899 totalt

**Dealett AI:**

Hur lång bindningstid har varje abonnemang kvar? Du kan svara en i taget, eller till exempel "3 månader på alla".

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

kan ni ge billigare?

**Dealett AI:**

Hur lång bindningstid har varje abonnemang kvar? Du kan svara en i taget, eller till exempel "3 månader på alla".

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 4

**Customer:**

vi använder ganska mycket surf

**Dealett AI:**

Hur lång bindningstid har varje abonnemang kvar? Du kan svara en i taget, eller till exempel "3 månader på alla".

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 5

**Customer:**

ingen aning om bindningstid just nu

**Dealett AI:**

Hur lång bindningstid har varje abonnemang kvar? Du kan svara en i taget, eller till exempel "3 månader på alla".

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| missing_family_per_person_reasoning | medium |  | Bot did not roughly reason about the family total/per-person price. |
| missing_family_followups | medium |  | Bot did not ask for both data needs and binding time in the family case. |

## Recommended Fixes

- When a family total is given, calculate or explain the approximate per-subscription price before selling.
- Family bundle flow should collect data needs and binding time for the group before recommendation.
