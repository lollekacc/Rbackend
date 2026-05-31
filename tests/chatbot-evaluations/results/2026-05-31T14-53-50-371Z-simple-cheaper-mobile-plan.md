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
Hej! Jag förstår att du vill ha ett billigare mobilabonnemang. För att kunna hjälpa dig bättre, kan du berätta hur många personer som ska ha abonnemanget? Och vilken operatör har du nu?

**Customer:**
Jag har bara ett abonnemang.

**Dealett AI:**
För att kunna hjälpa dig att hitta ett bättre abonnemang, kan du berätta vilken operatör du har nu? Och har du någon specifik månadskostnad eller prisklass i åtanke?

**Customer:**
Telia just nu.

**Dealett AI:**
För att kunna hjälpa dig med att hitta ett bättre abonnemang, kan du berätta om bindningstiden på ditt nuvarande abonnemang? Och vilken typ av mobilanvändning har du, till exempel mycket surf eller mest samtal?

**Customer:**
Det är ungefär två månader kvar.

**Dealett AI:**
För att kunna hjälpa dig vidare, kan du ta reda på hur lång bindningstid du har kvar på ditt nuvarande abonnemang? Och kan du berätta om du gillar att använda mycket surf eller mest samtal?

**Customer:**
Jag använder mest streaming och video, kanske 25 GB i månaden.

**Dealett AI:**
Tack för informationen! Eftersom du har ungefär två månader kvar på ditt abonnemang, kan det vara bra att veta vilket prisintervall du har i åtanke för det nya abonnemanget? Dessutom, är det viktigt för dig att ha ett abonnemang med låg bindningstid?

**Customer:**
Jag betalar 399 kr i månaden.

**Dealett AI:**
För att kunna ge dig det bästa förslaget, kan du bekräfta om du vill stanna kvar hos Telia eller om du är öppen för andra operatörer? Dessutom, har du övervägt om du vill ha en kortare bindningstid?

**Customer:**
Okej, varför är det bättre än det jag har?

**Dealett AI:**
För att hjälpa dig bäst, kan du berätta om du föredrar att stanna hos Telia, eller om du är öppen för att jämföra med andra operatörer? Och har du funderat på om du vill ha en kortare bindningstid?

**Customer:**
Kan jag gå vidare om det ser bra ut?

**Dealett AI:**
För att hjälpa dig vidare, kan du bekräfta om du föredrar att stanna hos Telia eller om du är öppen för att jämföra med andra operatörer? Dessutom, har du funderat på huruvida du vill ha en kortare bindningstid?

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 2 | Kept asking for binding time after the customer had already supplied it. |
| Used Dealett data correctly | 4 | Used Dealett offer/cart/routing data where relevant. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 2 | No valid offer was produced after the customer supplied the required scenario information. |
| Sales ability | 2 | Could not close the recommendation despite enough customer information in the scenario. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 1 | Asked for sensitive personal details in chat. |

## Weaknesses Found

- The assistant appeared to ask for sensitive personal details in chat.
- The assistant did not produce a valid offer after the customer supplied all required scenario information.
- The assistant kept asking for binding time after the customer had already supplied it.

## Suggested Fixes

- Keep all personal details, BankID, payment and phone number collection inside the cart/checkout flow.
- Improve qualification extraction for natural customer wording and ensure the bot stops asking extra non-required questions once required fields are present.
- Teach the qualification parser to understand spelled-out Swedish numbers like två, åtta and tio months.
