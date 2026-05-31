# Soft Values Live Simulation: Friend coverage signal

- Timestamp: 2026-05-31T18:14:46.583Z
- Session: 2026-05-31T18-14-37-950Z-soft-friend-coverage-signal
- API: http://localhost:3000/api/chat
- JSON: /Users/ya2ola/Desktop/rdealett/Rbackend/tests/chatbot-evaluations/results/2026-05-31T18-14-37-950Z-soft-friend-coverage-signal.json
- Final score: 1/5

## Customer Profile

Friend has Telia and it works well at customer home.

## Transcript

### Turn 1

**Customer:**

min kompis har telia och det funkar bra hos mig

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
