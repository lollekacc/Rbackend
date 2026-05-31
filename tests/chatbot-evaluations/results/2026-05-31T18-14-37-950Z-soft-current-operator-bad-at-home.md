# Soft Values Live Simulation: Current operator bad at home

- Timestamp: 2026-05-31T18:14:46.578Z
- Session: 2026-05-31T18-14-37-950Z-soft-current-operator-bad-at-home
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T18-14-37-950Z-soft-current-operator-bad-at-home.json
- Final score: 1/5

## Customer Profile

Customer says Tele2 is bad at home.

## Transcript

### Turn 1

**Customer:**

har tele2 och det suger hemma

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
| ignores_soft_signal | major |  | Bot ignored useful approximate or contextual signal. |

## Recommended Fixes

- Add a soft-guidance layer for vague, approximate and emotional customer messages.
- Use approximate area/operator/friend signals as useful but uncertain context.
