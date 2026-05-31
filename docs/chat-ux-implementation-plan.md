# Chat UX Implementation Plan

This plan describes a safe order for implementing the Chat UX Decision Matrix. It is intentionally staged so Dealett AI can improve response format without weakening recommendation, market-intelligence, pricing, or offer validation.

## Phase 1: Matrix Only

Status: planning only.

Actions:

- Add `docs/chat-ux-decision-matrix.md`.
- Add `docs/chat-ux-decision-matrix.json`.
- Review response modes, intent IDs, embedded widgets, and navigation rules.
- Do not change chat behavior.
- Do not change frontend rendering.
- Do not change market data.
- Do not change offer logic.

Success criteria:

- The team agrees on when the assistant should answer with text, buttons, offer cards, embedded widgets, or page navigation.
- The JSON matrix can become the source of truth for later implementation.

## Phase 2: Backend ResponseMode Metadata

Add metadata to the chat response without changing the natural-language reply logic.

Target shape:

```json
{
  "responseMode": "text",
  "buttons": [],
  "embeddedWidget": "none",
  "shouldStayInChat": true,
  "navigationTarget": null
}
```

Rules:

- The metadata must be derived from intent, conversation style, market intelligence state, offer validation, and the decision matrix.
- Metadata must not override safety checks.
- Metadata must not show offers unless offer validation already allows it.
- Metadata must not navigate to checkout unless a valid selected offer/cart item exists.
- Trust, suspicious price, campaign uncertainty, and binding period safeguards must win over UI convenience.

Suggested backend steps:

1. Add a small `chatResponseMode` helper.
2. Load or mirror the decision matrix by intent.
3. Map existing internal intents to matrix intent IDs.
4. Return response metadata alongside the existing reply.
5. Keep old frontend compatible by making all new fields optional.

## Phase 3: Frontend Rendering

Teach the chat frontend to render richer response modes when metadata is present.

Renderers:

- quick reply buttons
- choice buttons
- confirmation buttons
- action buttons
- offer cards
- coverage selector placeholder
- operator comparison cards
- reward comparison cards
- family builder placeholder
- broadband checker placeholder
- cart summary

Frontend rules:

- Existing chat must still work when metadata is missing.
- Buttons should call existing chat actions or send a normal message.
- Offer cards must reuse validated backend offer data.
- Embedded widgets can start as placeholders.
- Page navigation must require an explicit user click.
- Do not auto-navigate from a bot reply.

## Phase 4: Evaluator Updates

Update live evaluators to check not only reply text, but also response mode and routing.

Checks:

- Correct response mode for intent.
- Buttons shown when useful.
- No external navigation when chat widget should be used.
- One-question default.
- No more than two questions unless the user asks for a checklist.
- No offer cards before validation.
- Coverage map starts inside chat.
- Trust/bias questions remain text-first.
- Presentkort flows warn about total value.

Suggested evaluator flags:

- `wrong_response_mode`
- `missing_buttons`
- `unnecessary_navigation`
- `offer_cards_too_early`
- `over_questioning`
- `missing_uncertainty`
- `reward_over_fit`
- `coverage_not_chat_first`
- `trust_not_text_first`

## Phase 5: Coverage Selector Inside Chat

Implement the first real embedded widget: `coverage_selector`.

Minimum widget:

- short uncertainty text
- buttons:
  - `Använd min position`
  - `Ange adress`
  - `Jämför operatörer`
- optional `Full karta` action

Rules:

- Do not guarantee coverage.
- Do not require a full address if the user only wants general guidance.
- Treat vague areas as useful but uncertain signals.
- Navigate to full coverage page only if the user asks for it or clicks `Full karta`.

## Recommended Implementation Order

1. Backend response metadata only.
2. Frontend quick replies and action buttons.
3. Frontend safe page-navigation action handling.
4. Offer card metadata alignment with existing validated offer cards.
5. Coverage selector placeholder.
6. Evaluator checks for response modes.
7. Real coverage selector behavior.
8. Reward comparison widget.
9. Family builder widget.
10. Operator comparison widget.

## Rollback Strategy

Each phase should be reversible:

- Phase 2 can be disabled by omitting response metadata.
- Phase 3 can ignore unknown metadata and fall back to text.
- Embedded widgets can fall back to buttons.
- Page navigation should always require user click, so bad metadata cannot force navigation.

## Risks To Watch

- Metadata accidentally bypasses market-intelligence safeguards.
- Buttons become too many and clutter the chat.
- Embedded widgets delay a simple answer.
- Page navigation happens before the user is ready.
- Offer cards appear before enough data is collected.
- Coverage UI implies false certainty.
- Presentkort UI over-optimizes for reward instead of total value.

## Definition Of Done

The Chat UX matrix is successfully implemented when:

- normal user needs stay in chat
- direct answers are answered first
- confused users get simple buttons
- coverage starts inside chat
- offers are shown as cards only after validation
- checkout/login/legal flows navigate only after explicit user action
- evaluators confirm one-question default and correct response modes
