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
Självklart, jag kan hjälpa dig med det! För att kunna ge dig bästa möjliga erbjudande, kan du berätta vilka operatörer ni är intresserade av och om ni har några befintliga abonnemang som snart löper ut?

**Customer:**
Det är jag, min fru och vår son.

**Dealett AI:**
För att hjälpa er samla abonnemangen, kan ni berätta vilken operatör ni föredrar? Har ni några befintliga abonnemang med bindningstid som snart går ut?

**Customer:**
Jag har Telia, min fru har Tele2 och sonen har Telia.

**Dealett AI:**
För att kunna ge er det bästa erbjudandet behöver jag veta hur lång bindningstid ni har kvar på era nuvarande abonnemang. Kan ni också dela med er av hur mycket mobilsurf ni brukar använda per månad?

**Customer:**
Jag har ingen bindningstid, min fru har två månader kvar och sonen har åtta månader kvar.

**Dealett AI:**
Tack för informationen! Eftersom ni har olika bindningstider behöver jag veta hur länge din fru och sonen har kvar på sina abonnemang. Kan du bekräfta de exakta antalet månader? Det skulle hjälpa mig att ge er bättre alternativ!

**Customer:**
Vi streamar ganska mycket och vill helst ha mycket surf.

**Dealett AI:**
Tack för informationen! För att kunna hjälpa er bättre, kan du bekräfta hur länge din fru och son har kvar på sina abonnemang? Har ni också någon speciell prisnivå i åtanke för de nya abonnemangen?

**Customer:**
Vi betalar ungefär 399 kr, 329 kr och 299 kr.

**Dealett AI:**
Jag förstår! Kan du bekräfta exakt hur länge din fru och son har kvar på sina abonnemang? Det hjälper mig att ge er de bästa alternativen.

**Customer:**
Kan vi ändå samla allt nu?

**Dealett AI:**
För att kunna hjälpa er vidare och ge er bästa erbjudanden behöver jag veta exakt hur många månader din fru och son har kvar på sina abonnemang. Kan du bekräfta det?

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 2 | Appeared to confuse “tre personer” with the operator Tre. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 4 | Follow-up questions generally matched missing information. |
| Used Dealett data correctly | 2 | Mentioned Tre as context before the customer selected that operator. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 4 | Offer behavior matched available qualification state. |
| Sales ability | 4 | Kept the customer moving toward comparison or next step. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- The assistant did not explain Dealett’s 6-month binding-time rule when the scenario depended on it.
- The assistant appeared to confuse “tre personer” with the operator Tre.

## Suggested Fixes

- When binding time is over 6 months, explain that Dealett should not create an offer until the remaining binding time is 6 months or less.
- Prevent operator extraction from matching “Tre” when it is used as the number three before words like personer or abonnemang.
