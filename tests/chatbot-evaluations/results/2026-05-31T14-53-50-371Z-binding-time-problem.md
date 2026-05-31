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
För att kunna hjälpa dig med att byta abonnemang från Telenor behöver jag veta hur många personer som ska ha abonnemanget. Kan du berätta det? Om du har några preferenser för mobilanvändning eller pris är också det bra att veta!

**Customer:**
Det gäller ett abonnemang.

**Dealett AI:**
För att jag ska kunna ge dig rätt erbjudande från Telenor, kan du berätta om din nuvarande bindningstid? Har du några specifika önskemål vad gäller mobilanvändning, som exempelvis surf eller samtal? Det skulle hjälpa mig att skapa ett mer skräddarsytt alternativ för dig!

**Customer:**
Jag betalar 349 kr i månaden.

**Dealett AI:**
För att ge dig ett bra erbjudande behöver jag veta hur länge du är bunden till ditt nuvarande abonnemang hos Telenor. Kan du också berätta hvilket mobilanvändningsbehov du har? Till exempel, hur mycket surf eller samtal vill du ha per månad?

**Customer:**
Jag har tio månader kvar på bindningstiden.

**Dealett AI:**
Tack för att du delar det! Du nämnde att du har tio månader kvar av bindningstiden. Om jag förstår rätt, innebär det att vi kanske behöver slå ihop kostnaderna för att se om det blir billigare. Kan du också berätta hur mycket surf eller samtal du behöver per månad? Det skulle hjälpa mig att hitta rätt abonnemang för dig!

**Customer:**
Jag vill ha obegränsad surf.

**Dealett AI:**
För att kunna ge dig det bästa alternativet med obegränsad surf, skulle jag behöva veta om du är öppen för att titta på erbjudanden från andra operatörer än Telenor också. Skulle det vara okej för dig?

**Customer:**
Finns det något ni kan göra ändå?

**Dealett AI:**
Jag förstår! För att hjälpa dig med de bästa erbjudandena med obegränsad surf, behöver jag veta när din bindningstid hos Telenor går ut. Kan du ge mig det datumet?

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
