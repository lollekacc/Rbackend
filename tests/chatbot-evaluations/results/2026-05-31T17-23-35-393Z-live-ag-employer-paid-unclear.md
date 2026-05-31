# Live Customer Simulation: AG Employer paid unclear

- Timestamp: 2026-05-31T17:23:58.779Z
- Session: 2026-05-31T17-23-35-393Z-ag-employer-paid-unclear
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-23-35-393Z-live-ag-employer-paid-unclear.json
- Final score: 1/5

## Customer Profile

- Customer has employer-paid plan.
- Bot should classify carefully and not try to beat what customer may not pay.

## Transcript

### Turn 1

**Customer:**

jobbet betalar typ halva mitt abonnemang

**Dealett AI:**

Jag kan inte se ditt aktiva abonnemang från chatten. Mina sidor ska visa nuvarande abonnemang, bindningstid och fakturor.

**API Signals:**

- intent: support
- market status: none
- valid offer: no

### Turn 2

**Customer:**

jag betalar bara 100 kr själv

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

kan Dealett slå det?

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| missing_exception_clarification | critical |  | Bot did not ask about campaign/family/student/employer/winback terms. |

## Recommended Fixes

- For very low prices, ask if it is campaign, family/shared, student/senior/youth, employer-paid, retained or winback.
