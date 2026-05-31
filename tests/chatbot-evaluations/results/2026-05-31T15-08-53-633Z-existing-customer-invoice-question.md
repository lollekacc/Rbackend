# Test: Existing customer invoice question

## Customer Profile

- Existing customer
- No account context available

## Transcript

**Customer:**
När kommer min faktura? Jag hittar den inte.

**Dealett AI:**
Jag kan guida dig, men jag har inte live-data om konto eller faktura i chatten. Använd Mina sidor för exakta faktura- eller abonnemangsuppgifter.

**Customer:**
Jag är redan kund hos er.

**Dealett AI:**
Jag kan guida dig, men jag har inte live-data om konto eller faktura i chatten. Använd Mina sidor för exakta faktura- eller abonnemangsuppgifter.

**Customer:**
Kan du bara säga ungefär vilket datum?

**Dealett AI:**
Jag har tyvärr inte möjlighet att ge ett exakt datum för fakturan. Du kan kontrollera på Mina sidor för att få mer information om din faktura. Har du några andra frågor jag kan hjälpa till med?

**Customer:**
Okej, var ska jag kolla då?

**Dealett AI:**
Jag kan inte ge något exakt datum för fakturan. Men jag rekommenderar att du kontrollerar på Mina sidor. Har du specifika frågor om ditt abonnemang eller något annat jag kan hjälpa med?

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
