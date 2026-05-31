# Live Customer Simulation: S Vet inte customer

- Timestamp: 2026-05-31T17:24:30.552Z
- Session: 2026-05-31T17-24-17-990Z-s-vet-inte-customer
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T17-24-17-990Z-live-s-vet-inte-customer.json
- Final score: 1/5

## Customer Profile

- Customer repeatedly says vet inte.
- Bot should keep moving gently and explain exact calculation needs facts.

## Transcript

### Turn 1

**Customer:**

jag vet inte vad jag har

**Dealett AI:**

Jag förstår att du kanske är osäker på vad du har för abonnemang. Kan du berätta lite mer om vad du vill veta? Till exempel, är du intresserad av att jämföra priser eller täckning för mobilabonnemang?

**API Signals:**

- intent: unclear
- market status: none
- valid offer: no

### Turn 2

**Customer:**

vet inte operatör

**Dealett AI:**

Ingen fara. Vi börjar enkelt: gäller det ett abonnemang eller flera?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 3

**Customer:**

vet inte pris

**Dealett AI:**

Ingen fara. Vi börjar enkelt: gäller det ett abonnemang eller flera?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

### Turn 4

**Customer:**

bara säg vad som är bäst

**Dealett AI:**

För att hjälpa dig bättre, kan du berätta om ditt mobilanvändande? Till exempel, hur mycket data använder du i månaden eller vad är viktigt för dig när det kommer till ett abonnemang? Och har du några specifika områden där du vill ha bra täckning?

**API Signals:**

- intent: unclear
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| too_many_questions | critical | 4 | Bot asked more than two questions in one reply. |
| ignored_unknowns | critical |  | Bot did not explain that exact recommendation needs real facts. |

## Recommended Fixes

- Limit live chat replies to one clear next question unless the user asks for a checklist.
- When customers say vet inte, explain which facts are needed for exact calculations and offer a rough next step.
