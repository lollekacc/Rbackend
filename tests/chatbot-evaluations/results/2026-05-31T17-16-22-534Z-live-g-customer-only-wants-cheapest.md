# Live Customer Simulation: G Customer only wants cheapest

- Timestamp: 2026-05-31T17:16:24.456Z
- Session: 2026-05-31T17-16-22-534Z-g-customer-only-wants-cheapest
- API: http://localhost:3100/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-16-22-534Z-live-g-customer-only-wants-cheapest.json
- Final score: 4/5

## Customer Profile

- Customer only wants the cheapest option.
- Bot should ask the minimal necessary next question and not overload them.

## Transcript

### Turn 1

**Customer:**

jag vill bara ha billigast

**Dealett AI:**

För att hjälpa dig att hitta det billigaste alternativet skulle jag behöva veta lite mer. Hur många personer söker ni abonnemang för? Har ni några specifika operatörer i åtanke?

**API Signals:**

- intent: unclear
- market status: none
- valid offer: no

### Turn 2

**Customer:**

ett abonnemang

**Dealett AI:**

Vilken operatör har du idag?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

tele2 idag

**Dealett AI:**

Hur lång bindningstid har du kvar?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 4

**Customer:**

ingen bindningstid

**Dealett AI:**

Hur använder du mobilen?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 5

**Customer:**

mest wifi

**Dealett AI:**

Vad betalar du per abonnemang idag?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 6

**Customer:**

299 kr

**Dealett AI:**

Jag hittade ett giltigt alternativ: Halebop 3 GB för 149 kr/mån. Uppskattad vinst är 7600 kr efter dubbelkostnad och presentkort.

**API Signals:**

- intent: mobile_offer
- market status: realistic
- valid offer: yes

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| not_minimal_for_cheapest_customer | medium |  | Bot asked too much at once for a cheapest-only customer. |

## Recommended Fixes

- For cheapest-only customers, ask one minimal required question at a time.
