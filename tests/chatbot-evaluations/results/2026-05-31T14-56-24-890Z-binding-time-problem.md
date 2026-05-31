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
För att kunna ge dig det bästa erbjudandet, kan du berätta hur många personer som ska ha abonnemanget? Och vilken typ av mobilanvändning har ni, till exempel om ni ofta surfar, ringer mycket eller liknande?

**Customer:**
Det gäller ett abonnemang.

**Dealett AI:**
Jag förstår att du vill byta abonnemang från Telenor. För att vi ska kunna ge dig ett skräddarsytt erbjudande, kan du berätta när ditt nuvarande bindningstid slutar? Och vad är din typiska mobilanvändning - ringer du mycket, surfar du mycket eller kanske något annat?

**Customer:**
Jag betalar 349 kr i månaden.

**Dealett AI:**
För att vi ska kunna ge dig ett anpassat erbjudande, kan du berätta när din nuvarande bindningstid med Telenor slutar? Och hur ser din typiska mobilanvändning ut - ringer eller surfar du mest?

**Customer:**
Jag har tio månader kvar på bindningstiden.

**Dealett AI:**
För att vi ska kunna ge dig ett bra erbjudande, kan du berätta när din nuvarande bindningstid med Telenor slutar? Och hur ser din typiska mobilanvändning ut - ringer du mycket eller surfar du mest?

**Customer:**
Jag vill ha obegränsad surf.

**Dealett AI:**
Jag förstår att du vill ha obegränsad surf. Eftersom du har 10 månader kvar på bindningstiden med Telenor, kan jag hjälpa dig att jämföra erbjudanden när bindningstiden är slut. Djupdyker du i din användning - ringer du mer än du surfar eller tvärtom? Och finns det någon specifik operatör du vill jämföra?

**Customer:**
Finns det något ni kan göra ändå?

**Dealett AI:**
Jag ser att vi fortfarande behöver klargöra när din bindningstid med Telenor slutar. Det skulle hjälpa oss att ge en mer exakt jämförelse av erbjudanden. Kan du också berätta om det är någon specifik operatör som intresserar dig?

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 2 | Appeared to confuse “tre personer” with the operator Tre. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 2 | Kept asking for binding time after the customer had already supplied it. |
| Used Dealett data correctly | 2 | Mentioned Tre as context before the customer selected that operator. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 4 | Offer behavior matched available qualification state. |
| Sales ability | 4 | Kept the customer moving toward comparison or next step. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- The assistant did not explain Dealett’s 6-month binding-time rule when the scenario depended on it.
- The assistant kept asking for binding time after the customer had already supplied it.
- The assistant appeared to confuse “tre personer” with the operator Tre.

## Suggested Fixes

- When binding time is over 6 months, explain that Dealett should not create an offer until the remaining binding time is 6 months or less.
- Teach the qualification parser to understand spelled-out Swedish numbers like två, åtta and tio months.
- Prevent operator extraction from matching “Tre” when it is used as the number three before words like personer or abonnemang.
