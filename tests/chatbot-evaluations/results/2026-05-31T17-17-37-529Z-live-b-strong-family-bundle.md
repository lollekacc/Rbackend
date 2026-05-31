# Live Customer Simulation: B Strong family bundle

- Timestamp: 2026-05-31T17:17:37.602Z
- Session: 2026-05-31T17-17-37-529Z-b-strong-family-bundle
- API: http://localhost:3100/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-17-37-529Z-live-b-strong-family-bundle.json
- Final score: 2/5

## Customer Profile

- 5 people on Tele2 family.
- Customer thinks total cost is about 899 kr.
- Bot should roughly understand per-person price and avoid forcing a switch.

## Transcript

### Turn 1

**Customer:**

vi är 5 personer och har tele2 familj

**Dealett AI:**

Hur lång bindningstid har varje abonnemang kvar? Du kan svara en i taget, eller till exempel "3 månader på alla".

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 2

**Customer:**

tror vi betalar typ 899 totalt

**Dealett AI:**

899 kr totalt är cirka 180 kr per abonnemang, så det kan redan vara ett starkt familjeavtal. Jag behöver bindningstiden innan jag jämför.

**API Signals:**

- intent: mobile_offer
- market status: realistic
- valid offer: no

### Turn 3

**Customer:**

kan ni ge billigare?

**Dealett AI:**

899 kr totalt är cirka 180 kr per abonnemang, så det kan redan vara ett starkt familjeavtal. Jag behöver bindningstiden innan jag jämför.

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 4

**Customer:**

vi använder ganska mycket surf

**Dealett AI:**

899 kr totalt är cirka 180 kr per abonnemang, så det kan redan vara ett starkt familjeavtal. Jag behöver bindningstiden innan jag jämför.

**API Signals:**

- intent: mobile_offer
- market status: realistic
- valid offer: no

### Turn 5

**Customer:**

ingen aning om bindningstid just nu

**Dealett AI:**

899 kr totalt är cirka 180 kr per abonnemang, så det kan redan vara ett starkt familjeavtal. Jag behöver bindningstiden innan jag jämför.

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| invented_exact_price_without_source | major | 2 | Bot mentioned 899 kr/SEK, but that amount was not in the user turn or API offer data. |
| invented_exact_price_without_source | major | 3 | Bot mentioned 899 kr/SEK, but that amount was not in the user turn or API offer data. |
| invented_exact_price_without_source | major | 3 | Bot mentioned 180 kr/SEK, but that amount was not in the user turn or API offer data. |
| invented_exact_price_without_source | major | 4 | Bot mentioned 899 kr/SEK, but that amount was not in the user turn or API offer data. |
| invented_exact_price_without_source | major | 5 | Bot mentioned 899 kr/SEK, but that amount was not in the user turn or API offer data. |
| invented_exact_price_without_source | major | 5 | Bot mentioned 180 kr/SEK, but that amount was not in the user turn or API offer data. |

## Recommended Fixes

- Only mention exact prices that come from the customer, offer engine, cart, or verified market data.
