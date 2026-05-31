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
Självklart! Jag kan hjälpa er med att samla abonnemangen. Vilka operatörer har ni nu, och vilken typ av mobilanvändning har ni? Till exempel, snurrar ni på mycket data, eller är det mest samtal och SMS?

**Customer:**
Det är jag, min fru och vår son.

**Dealett AI:**
För att kunna hjälpa er bättre, kan ni berätta vilket abonnemang ni har just nu? Och när går er bindningstid ut för era nuvarande abonnemang?

**Customer:**
Jag har Telia, min fru har Tele2 och sonen har Telia.

**Dealett AI:**
För att kunna hjälpa er med att samla abonnemangen, kan ni berätta när bindningstiden går ut för era nuvarande abonnemang? Och vilken typ av mobilanvändning har ni? Till exempel, använder ni mycket data eller handlar det mest om samtal och SMS?

**Customer:**
Jag har ingen bindningstid, min fru har två månader kvar och sonen har åtta månader kvar.

**Dealett AI:**
Tack för informationen! Eftersom du har ingen bindningstid, men din fru har två månader kvar och sonen har åtta månader kvar, så kan vi se över alternativ för att samla era abonnemang. Vad har ni för mobilanvändning? Använder ni mycket data, eller är det mest samtal och SMS?

**Customer:**
Vi streamar ganska mycket och vill helst ha mycket surf.

**Dealett AI:**
Tack för informationen! För att kunna ge er bästa erbjudande, kan ni ange hur mycket surf ni behöver per månad? Vad skulle ni rekommendera för budget eller prisintervall för era abonnemang?

**Customer:**
Vi betalar ungefär 399 kr, 329 kr och 299 kr.

**Dealett AI:**
Tack för informationen! Eftersom din fru har två månader kvar på sitt abonnemang, kanske det är bra att vänta lite för att undvika avgifter? Vad skulle ni tycka om att vi ser på alternativ som erbjuder mycket surf och bra priser? För att ge er bäst hjälp, kan ni berätta om ni är intresserade av att byta operatör också?

**Customer:**
Kan vi ändå samla allt nu?

**Dealett AI:**
Tack för er tålmodighet! För att kunna säkra de bästa alternativen för er, kan ni berätta när din frus bindningstid går ut? Och, har ni några preferenser gällande vilken operatör ni vill välja?

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
