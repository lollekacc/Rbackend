# Test: Gift card question

## Customer Profile

- Interested in mobile subscription
- No selected offer yet

## Transcript

**Customer:**
Hur mycket presentkort får jag om jag byter abonnemang?

**Dealett AI:**
Värdet av presentkortet beror på det abonnemang du väljer via Dealett. Tyvärr har jag inte tillgång till specifika belopp just nu. Vilka typer av abonnemang är du intresserad av att byta till?

**Customer:**
Jag har inte valt något erbjudande än.

**Dealett AI:**
Det verkar som du inte har valt ett abonnemang ännu. Vill du ha hjälp med att hitta ett som passar dina behov? Eller finns det något specifikt du undrar över?

**Customer:**
Gäller det mobil också?

**Dealett AI:**
Ja, erbjudandet gäller även för mobilabonnemang. Är det något särskilt abonnemang eller operatör som du är intresserad av? Eller behöver du mer information om hur man jämför olika alternativ?

**Customer:**
Så hur går jag vidare för att veta exakt?

**Dealett AI:**
För att kunna guida dig vidare behöver vi veta lite mer. Vilken typ av abonnemang är du intresserad av, mobil eller bredband? Och har du en aktuell bindningstid som påverkar ditt beslut? 
Det skulle också hjälpa om du kan berätta om dina behov, till exempel hur du brukar använda abonnemanget.

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

- The assistant appeared to confuse “tre personer” with the operator Tre.

## Suggested Fixes

- Prevent operator extraction from matching “Tre” when it is used as the number three before words like personer or abonnemang.
