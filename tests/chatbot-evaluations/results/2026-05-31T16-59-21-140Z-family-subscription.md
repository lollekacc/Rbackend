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
Jag förstår. Nu behöver jag nuvarande operatör för varje abonnemang.

**Customer:**
Det är jag, min fru och vår son.

**Dealett AI:**
Jag förstår. Nu behöver jag nuvarande operatör för varje abonnemang.

**Customer:**
Jag har Telia, min fru har Tele2 och sonen har Telia.

**Dealett AI:**
Hur lång bindningstid har varje abonnemang kvar? Du kan svara en i taget, eller till exempel "3 månader på alla".

**Customer:**
Jag har ingen bindningstid, min fru har två månader kvar och sonen har åtta månader kvar.

**Dealett AI:**
Hur använder du mobilen?

**Customer:**
Vi streamar ganska mycket och vill helst ha mycket surf.

**Dealett AI:**
Vad betalar du per abonnemang idag?

**Customer:**
Vi betalar ungefär 399 kr, 329 kr och 299 kr.

**Dealett AI:**
Jag vill inte ge en fast rekommendation än eftersom marknadsjämförelsen behöver en uppgift till. Är priset ordinarie, kampanj, rabatt, familjedelat, arbetsgivarbetalt eller winback?

**Customer:**
Kan vi ändå samla allt nu?

**Dealett AI:**
Jag vill inte ge en fast rekommendation än eftersom marknadsjämförelsen behöver en uppgift till. Är priset ordinarie, kampanj, rabatt, familjedelat, arbetsgivarbetalt eller winback?

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 2 | Repeated the same answer multiple times. |
| Asked correct follow-ups | 4 | Follow-up questions generally matched missing information. |
| Used Dealett data correctly | 2 | Did not explain Dealett’s 6-month binding-time rule. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 4 | Offer behavior matched available qualification state. |
| Sales ability | 4 | Kept the customer moving toward comparison or next step. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- The assistant repeated the same answer instead of adapting to the user.
- The assistant did not explain Dealett’s 6-month binding-time rule when the scenario depended on it.

## Suggested Fixes

- Add variation or intent-progress memory for repeated unclear/support turns.
- When binding time is over 6 months, explain that Dealett should not create an offer until the remaining binding time is 6 months or less.
