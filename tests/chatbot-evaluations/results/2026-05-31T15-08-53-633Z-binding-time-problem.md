# Test: Binding time problem

## Customer Profile

- Current operator: Telenor
- Current price: 349 kr/month
- Binding time left: 10 months
- Data need: unlimited

## Transcript

**Customer:**
Jag vill byta från Telenor direkt, vad kan ni erbjuda?

**Dealett AI:**
Hur många abonnemang vill du ha?

**Customer:**
Det gäller ett abonnemang.

**Dealett AI:**
Hur lång bindningstid har du kvar?

**Customer:**
Jag betalar 349 kr i månaden.

**Dealett AI:**
Hur lång bindningstid har du kvar?

**Customer:**
Jag har tio månader kvar på bindningstiden.

**Dealett AI:**
Hur använder du mobilen?

**Customer:**
Jag vill ha obegränsad surf.

**Dealett AI:**
Jag ska inte rekommendera byte just nu eftersom minst ett abonnemang har mer än 6 månader kvar. Dealett tar bara fram erbjudande när bindningstiden är högst 6 månader och totalen blir billigare efter dubbelkostnad och presentkort.

**Customer:**
Finns det något ni kan göra ändå?

**Dealett AI:**
Inte som ett giltigt Dealett-byte idag. När mer än 6 månader återstår är rådet att vänta tills bindningstiden är högst 6 månader och sedan jämföra igen med exakt pris och bindningstid.

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 4 | Follow-up questions generally matched missing information. |
| Used Dealett data correctly | 4 | Used Dealett offer/cart/routing data where relevant. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 4 | Offer behavior matched available qualification state. |
| Sales ability | 4 | Kept the customer moving toward comparison or next step. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- No clear failure condition detected by the automated evaluator.

## Suggested Fixes

- Review transcript manually for tone, persuasion and edge cases.
