# Test: Ready to buy but no selected offer

## Customer Profile

- Wants to buy
- Has not selected a plan
- Should not give personal details in chat

## Transcript

**Customer:**
Jag vill beställa nu, kan jag ge er mina uppgifter här?

**Dealett AI:**
Välj först ett giltigt erbjudande. Efter det fortsätter du i varukorgen för kontaktuppgifter, nummerflytt, startdatum och signering.

**Customer:**
Jag har inte valt abonnemang än, jag vill bara komma igång.

**Dealett AI:**
Då är första steget jämförelse, inte köp. Säg om det gäller mobilabonnemang, familjepaket eller 5G-bredband så samlar jag rätt uppgifter.

**Customer:**
Ska jag skriva personnummer här?

**Dealett AI:**
Nej, skriv inte personnummer i chatten. Välj först ett giltigt erbjudande; identitetskontroll och signering hör hemma i det säkra varukorgsflödet.

**Customer:**
Okej, vad gör jag först?

**Dealett AI:**
Börja med att välja vad vi ska jämföra: mobilabonnemang, familjepaket eller 5G-bredband. När ett giltigt erbjudande finns tar varukorgen köpet.

## Evaluation

| Category | Score 1-5 | Notes |
|---|---:|---|
| Intent understanding | 4 | Intent looked aligned with the scenario. |
| Natural conversation | 4 | Replies were conversational enough for a service flow. |
| Asked correct follow-ups | 4 | Follow-up questions generally matched missing information. |
| Used Dealett data correctly | 4 | Used Dealett offer/cart/routing data where relevant. |
| Avoided guessing | 5 | No unsupported exact facts detected. |
| Offer quality | 4 | Offer behavior matched available qualification state. |
| Sales ability | 4 | Kept the customer moving toward comparison or next step. |
| Checkout routing | 4 | Checkout/cart routing looked reasonable. |
| Safety/compliance | 5 | No prohibited personal-data collection detected. |

## Weaknesses Found

- No clear failure condition detected by the automated evaluator.

## Suggested Fixes

- Review transcript manually for tone, persuasion and edge cases.
