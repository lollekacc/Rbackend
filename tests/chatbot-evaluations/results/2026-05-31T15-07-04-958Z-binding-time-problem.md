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
Jag ska inte rekommendera byte just nu eftersom minst ett abonnemang har mer än 6 månader kvar. Dealett tar bara fram erbjudande när bindningstiden är högst 6 månader och totalen blir billigare efter dubbelkostnad och presentkort.

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 2 | Repeated the same answer multiple times. |
| Asked correct follow-ups | 2 | Kept asking for binding time after the customer had already supplied it. |
| Used Dealett data correctly | 4 | Used Dealett offer/cart/routing data where relevant. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 4 | Offer behavior matched available qualification state. |
| Sales ability | 4 | Kept the customer moving toward comparison or next step. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- The assistant repeated the same answer instead of adapting to the user.
- The assistant kept asking for binding time after the customer had already supplied it.

## Suggested Fixes

- Add variation or intent-progress memory for repeated unclear/support turns.
- Teach the qualification parser to understand spelled-out Swedish numbers like två, åtta and tio months.
