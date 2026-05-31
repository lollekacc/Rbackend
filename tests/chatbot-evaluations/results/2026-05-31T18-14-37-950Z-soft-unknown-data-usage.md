# Soft Values Live Simulation: Unknown data usage

- Timestamp: 2026-05-31T18:14:38.004Z
- Session: 2026-05-31T18-14-37-950Z-soft-unknown-data-usage
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T18-14-37-950Z-soft-unknown-data-usage.json
- Final score: 1/5

## Customer Profile

Customer does not know monthly GB usage.

## Transcript

### Turn 1

**Customer:**

ingen aning hur mycket surf jag använder

**Dealett AI:**

Hur många abonnemang vill du ha?

**API Signals:**

- intent: mobile_offer
- market status: none
- valid offer: no

## Detected Issues

| Code | Severity | Turn | Notes |
|---|---|---:|---|
| no_practical_guidance | critical |  | Bot did not give expected practical soft guidance. |

## Recommended Fixes

- Add a soft-guidance layer for vague, approximate and emotional customer messages.
