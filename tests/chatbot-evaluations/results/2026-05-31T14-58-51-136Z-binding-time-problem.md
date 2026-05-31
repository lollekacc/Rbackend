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
För att kunna ge dig ett bra erbjudande behöver jag veta hur många personer abonnemanget ska gälla för. Kan du berätta det?

**Customer:**
Det gäller ett abonnemang.

**Dealett AI:**
För att kunna ge dig ett skräddarsytt erbjudande behöver jag veta hur länge du har kvar på ditt nuvarande abonnemang hos Telenor och vilket mobilanvändande du har. Kan du dela med dig av den informationen?

**Customer:**
Jag betalar 349 kr i månaden.

**Dealett AI:**
Tack för informationen! För att kunna ge dig ett erbjudande behöver jag veta hur länge du har kvar på ditt abonnemang hos Telenor. Kan du berätta det?

**Customer:**
Jag har tio månader kvar på bindningstiden.

**Dealett AI:**
Tack för informationen! Du nämnde att du har tio månader kvar på bindningstiden. För att kunna ge dig ett erbjudande, kan du berätta mer om hur du använder din mobil, exempelvis hur mycket surf och samtal du behöver?

**Customer:**
Jag vill ha obegränsad surf.

**Dealett AI:**
Vi har flera alternativ för obegränsad surf. Till exempel erbjuder Tele2 ett abonnemang för 399 kr/mån, och Tre har ett för 429 kr/mån. Vänligen, kan du berätta om du är intresserad av något särskilt av dessa alternativ?

**Customer:**
Finns det något ni kan göra ändå?

**Dealett AI:**
För att kunna ge dig ett konkret erbjudande behöver jag veta när din bindningstid hos Telenor slutar. Kan du dela den informationen?

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 2 | Kept asking for binding time after the customer had already supplied it. |
| Used Dealett data correctly | 2 | Did not explain Dealett’s 6-month binding-time rule. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 4 | Offer behavior matched available qualification state. |
| Sales ability | 4 | Kept the customer moving toward comparison or next step. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- The assistant did not explain Dealett’s 6-month binding-time rule when the scenario depended on it.
- The assistant kept asking for binding time after the customer had already supplied it.

## Suggested Fixes

- When binding time is over 6 months, explain that Dealett should not create an offer until the remaining binding time is 6 months or less.
- Teach the qualification parser to understand spelled-out Swedish numbers like två, åtta and tio months.
