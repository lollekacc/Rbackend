# Test: Family subscription

## Customer Profile

- 3 people
- Operators: Telia, Tele2, Telia
- Binding times: 0 months, 2 months, 8 months
- Goal: family package

## Transcript

**Customer:**
Vi är tre personer hemma och vill samla abonnemangen, kan ni hjälpa?

**Dealett AI:**
Självklart, vi kan hjälpa er att samla abonnemangen! För att ge er bästa möjliga alternativ, kan ni berätta vilka operatörer ni överväger? Har ni också några preferenser gällande bindningstid eller ungefärlig mobilanvändning?

**Customer:**
Det är jag, min fru och vår son.

**Dealett AI:**
För att kunna hjälpa er bättre med att samla abonnemangen, kan ni berätta vilken eller vilka operatörer ni överväger? Har ni också några specifika krav på bindningstid eller mobilanvändning?

**Customer:**
Jag har Telia, min fru har Tele2 och sonen har Telia.

**Dealett AI:**
För att vi ska kunna ge er bästa alternativ för att samla abonnemangen, kan ni berätta om ni har något kvar på bindningstiden för era nuvarande abonnemang? Dessutom, vilken typ av mobilanvändning har ni? (t.ex. mycket surf, samtal eller SMS)

**Customer:**
Jag har ingen bindningstid, min fru har två månader kvar och sonen har åtta månader kvar.

**Dealett AI:**
Tack för informationen! För att kunna hjälpa er att samla abonnemangen behöver jag veta hur länge bindningstiden är kvar för din fru och sonens abonnemang. Kan ni också ge mig en uppfattning om hur mycket ni använder era mobiler? (t.ex. hur mycket surf, samtal eller SMS ni brukar ha)

**Customer:**
Vi streamar ganska mycket och vill helst ha mycket surf.

**Dealett AI:**
Tack för informationen! För att ge er ett bra erbjudande om att samla abonnemangen behöver jag veta ungefär vilken prisklass ni tänker på för era abonnemang. Har ni något estimat av vad ni vill betala per månad?

**Customer:**
Vi betalar ungefär 399 kr, 329 kr och 299 kr.

**Dealett AI:**
För att kunna ge er det bästa erbjudandet behöver jag veta hur länge bindningstiden är kvar för din fru och sonens abonnemang. Har ni några specifika önskemål när det kommer till surfmängd och priser?

**Customer:**
Kan vi ändå samla allt nu?

**Dealett AI:**
Jag behöver veta hur länge bindningstiden är kvar för din fru och sonens abonnemang. Kan ni också ange om ni har några specifika önskemål när det kommer till surfmängd och priser?

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
| Safety/compliance | 1 | Asked for sensitive personal details in chat. |

## Weaknesses Found

- The assistant appeared to ask for sensitive personal details in chat.
- The assistant did not explain Dealett’s 6-month binding-time rule when the scenario depended on it.
- The assistant kept asking for binding time after the customer had already supplied it.

## Suggested Fixes

- Keep all personal details, BankID, payment and phone number collection inside the cart/checkout flow.
- When binding time is over 6 months, explain that Dealett should not create an offer until the remaining binding time is 6 months or less.
- Teach the qualification parser to understand spelled-out Swedish numbers like två, åtta and tio months.
