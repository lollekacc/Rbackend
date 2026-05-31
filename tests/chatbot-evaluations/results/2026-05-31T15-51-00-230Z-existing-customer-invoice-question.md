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
Jag förstår att du vill veta datumet för din faktura, men jag har tyvärr inte den informationen. Har du loggat in på Mina sidor för att kontrollera det? Eller behöver du hjälp med något annat för att hitta informationen?

**Customer:**
Okej, var ska jag kolla då?

**Dealett AI:**
Tyvärr kan jag inte ge ett exakt datum för din faktura. Har du försökt att logga in på Mina sidor? Finns det något annat jag kan hjälpa dig med?

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
