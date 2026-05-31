# Test: Simple cheaper mobile plan

## Customer Profile

- Current operator: Telia
- Current price: 399 kr/month
- Binding time left: 2 months
- Data need: 25 GB/month
- Goal: cheaper subscription

## Transcript

**Customer:**
Hej, jag tycker mitt mobilabonnemang är för dyrt.

**Dealett AI:**
Hej! Jag förstår att du vill ha ett billigare mobilabonnemang. För att hjälpa dig bättre, kan du berätta hur många personer som ska ha abonnemanget? Och om du har en specifik operatör i åtanke?

**Customer:**
Jag har bara ett abonnemang.

**Dealett AI:**
För att kunna hjälpa dig att hitta ett bättre abonnemang, kan du berätta vilken operatör du använder? Och har du några specifika behov kring exempelvis datamängd eller månadskostnad?

**Customer:**
Telia just nu.

**Dealett AI:**
Jag förstår, det är viktigt med rätt abonnemang! För att hjälpa dig bättre, kan du berätta när ditt nuvarande abonnemang går ut? Och vilken datamängd behöver du per månad?

**Customer:**
Det är ungefär två månader kvar.

**Dealett AI:**
Det är bra att veta när ditt abonnemang går ut! Kan du ange det exakta datumet eller hur många månader kvar du har? Dessutom, vilken datamängd använder du i månaden?

**Customer:**
Jag använder mest streaming och video, kanske 25 GB i månaden.

**Dealett AI:**
För att kunna ge dig bästa möjliga erbjudande, kan du dela med dig av vilken datamängd du ansöker om per månad? Och har du någon specifik månadskostnad i åtanke?

**Customer:**
Jag betalar 399 kr i månaden.

**Dealett AI:**
Tack för informationen! Du nämnde att du använder 25 GB i månaden. Skulle du kunna bekräfta vilket datum ditt abonnemang med Telia går ut? Och är det något annat du prioriterar i ditt abonnemang, som hastighet eller extra tjänster?

**Customer:**
Okej, varför är det bättre än det jag har?

**Dealett AI:**
Det låter bra! Jag behöver veta vilken operatör du vill jämföra med Telia för att hitta det bästa erbjudandet. Kan du också ange vilket datum ditt abonnemang går ut?

**Customer:**
Kan jag gå vidare om det ser bra ut?

**Dealett AI:**
För att kunna hjälpa dig bättre, kan du berätta vilken specifik operatör du tänker på? Och när går ditt nuvarande abonnemang med Telia ut?

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 4 | Follow-up questions generally matched missing information. |
| Used Dealett data correctly | 4 | Used Dealett offer/cart/routing data where relevant. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 2 | No valid offer was produced after the customer supplied the required scenario information. |
| Sales ability | 2 | Could not close the recommendation despite enough customer information in the scenario. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- The assistant did not produce a valid offer after the customer supplied all required scenario information.

## Suggested Fixes

- Improve qualification extraction for natural customer wording and ensure the bot stops asking extra non-required questions once required fields are present.
