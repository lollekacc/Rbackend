# Dealett AI Chat UX Decision Matrix

This is a planning document only. It defines how Dealett AI should choose between text, buttons, offer cards, embedded chat widgets, and page navigation. It does not change chatbot behavior, UI, market data, or offer logic.

The machine-readable version is `docs/chat-ux-decision-matrix.json`.

## Core Principles

1. Chat-first by default. Most normal user needs should be handled inside the chat.
2. Use buttons whenever they reduce typing or lower effort.
3. Ask one question at a time by default.
4. Ask two questions only when they are tightly connected.
5. Do not ask three or more questions unless the user explicitly asks for a full checklist.
6. Answer before asking when the user asks for a best choice, direct choice, short answer, browsing help, coverage comparison, or Dealett explanation.
7. Coverage and coverage map flows should stay inside chat. Only navigate to a full page if the user asks for a large or full-screen map.
8. Offer recommendations should use cards inside chat after validation.
9. Full page navigation should be reserved for checkout, login/account, legal terms, requested full-screen coverage maps, and complex comparison tables.
10. Trust and payment questions should be answered directly in text before offers are shown.
11. Presentkort/reward requests should compare total value, not only reward size.
12. Confused customers should get simple buttons.
13. Angry customers should get short acknowledgement plus one useful action.
14. Direct recommendation requests should get a safe qualified guess first, then one optional refinement.
15. Mixed mobile and broadband needs should be split gently.

## Response Modes

| Mode | Use When | Avoid When |
|---|---|---|
| `text` | The customer needs explanation, trust-building, reassurance, or a direct answer. | A choice would reduce typing or the user is confused. |
| `buttons` | The user is unclear, impatient, browsing, or choosing between known paths. | The answer requires detailed reasoning or legal wording. |
| `offer_cards` | Dealett has enough validated data to show sellable offers. | Suspicious price, unclear campaign, unknown binding risk, or trust question. |
| `embedded_widget` | The task needs lightweight structure inside chat, such as coverage, family builder, reward comparison, or cart summary. | The flow requires secure account data or final checkout. |
| `page_navigation` | Checkout, login/account, legal terms, full-screen map, or complex comparison table. | Normal discovery, coverage selection, browsing, or questions that can be answered in chat. |

## Decision Matrix

| Intent | Primary Mode | Allowed Modes | Answer First | Max Questions | Button Strategy | Embedded Widget | Stay In Chat | Navigate When |
|---|---|---|---:|---:|---|---|---:|---|
| greeting / unclear start | `buttons` | `text`, `buttons` | yes | 1 | quick replies | none | yes | Never before the user chooses a task. |
| browsing from ad | `buttons` | `text`, `buttons` | yes | 1 | quick replies | none | yes | Do not navigate; browsing should stay in chat. |
| direct recommendation | `text` | `text`, `buttons`, `offer_cards` | yes | 1 | choice buttons | none | yes | Checkout only after a validated offer exists. |
| mobile subscription recommendation | `buttons` | `text`, `buttons`, `offer_cards` | no | 2 | choice buttons | offer cards | yes | Checkout only after offer cards and user action. |
| family mobile subscription | `embedded_widget` | `text`, `buttons`, `embedded_widget`, `offer_cards` | yes | 1 | choice buttons | family builder | yes | Checkout or complex comparison only. |
| child/youth subscription | `buttons` | `text`, `buttons`, `offer_cards` | yes | 1 | choice buttons | none | yes | Checkout or full terms only. |
| senior/simple subscription | `buttons` | `text`, `buttons`, `offer_cards` | yes | 1 | choice buttons | none | yes | Checkout or full terms only. |
| student subscription | `buttons` | `text`, `buttons`, `offer_cards` | yes | 1 | choice buttons | none | yes | Student verification or checkout only. |
| business subscription | `text` | `text`, `buttons`, `page_navigation` | yes | 1 | action buttons | none | yes | Business/contact page for quote or company terms. |
| 5G broadband / home internet | `embedded_widget` | `text`, `buttons`, `embedded_widget`, `offer_cards` | yes | 1 | action buttons | broadband checker | yes | Full broadband page or checkout only on request/action. |
| mobile + broadband mixed need | `buttons` | `text`, `buttons`, `embedded_widget` | yes | 1 | choice buttons | none | yes | After user chooses first track. |
| coverage/täckning | `embedded_widget` | `text`, `buttons`, `embedded_widget` | yes | 1 | action buttons | coverage selector | yes | Full-screen map only if requested. |
| coverage map request | `embedded_widget` | `text`, `buttons`, `embedded_widget`, `page_navigation` | yes | 0 | action buttons | coverage selector | yes | Full map only when user chooses it. |
| operator comparison | `embedded_widget` | `text`, `buttons`, `embedded_widget`, `page_navigation` | yes | 1 | choice buttons | operator comparison | yes | Full table only if too large for chat. |
| price comparison | `buttons` | `text`, `buttons`, `offer_cards`, `embedded_widget` | yes | 1 | choice buttons | operator comparison | yes | Checkout or full table only. |
| current deal check | `text` | `text`, `buttons`, `offer_cards` | yes | 1 | choice buttons | none | yes | Checkout only if Dealett has a validated better offer. |
| suspiciously low customer price | `text` | `text`, `buttons` | yes | 1 | choice buttons | none | yes | Do not navigate before clarification. |
| campaign price uncertainty | `text` | `text`, `buttons` | yes | 1 | choice buttons | none | yes | Do not navigate before campaign length/normal price is clear enough. |
| binding period | `text` | `text`, `buttons`, `offer_cards` | yes | 1 | choice buttons | none | yes | Only after double-cost risk is explained and offer is valid. |
| presentkort/reward comparison | `embedded_widget` | `text`, `buttons`, `embedded_widget`, `offer_cards` | yes | 1 | choice buttons | reward comparison | yes | Checkout only after valid offer. |
| highest reward request | `embedded_widget` | `text`, `buttons`, `embedded_widget` | yes | 1 | confirmation buttons | reward comparison | yes | Do not go directly to checkout. |
| trust/bias/payment question | `text` | `text`, `buttons` | yes | 0 | action buttons | none | yes | Do not navigate; answer trust question first. |
| angry/frustrated customer | `text` | `text`, `buttons` | yes | 1 | quick replies | none | yes | Contact page only if user asks for human support. |
| confused/typo-heavy customer | `buttons` | `text`, `buttons` | yes | 1 | quick replies | none | yes | Do not navigate. |
| checkout / buy flow | `page_navigation` | `text`, `buttons`, `offer_cards`, `page_navigation` | yes | 0 | action buttons | cart summary | no | Only when valid offer/card exists or cart has selected item. |
| cart / varukorg | `embedded_widget` | `text`, `buttons`, `embedded_widget`, `page_navigation` | yes | 0 | action buttons | cart summary | yes | Cart page/drawer for edit or checkout. |
| login/account | `page_navigation` | `text`, `buttons`, `page_navigation` | yes | 0 | action buttons | none | no | Account-specific data requires login. |
| legal terms | `page_navigation` | `text`, `buttons`, `page_navigation` | yes | 0 | action buttons | none | no | Exact legal wording is needed. |
| support/contact | `buttons` | `text`, `buttons`, `page_navigation` | yes | 1 | action buttons | none | yes | Contact page for human support, complaint, or account-specific help. |
| explanation of recommendation | `text` | `text`, `buttons`, `offer_cards` | yes | 0 | action buttons | none | yes | Do not navigate; explain in chat first. |

## Recommended First Replies

These examples define tone and routing, not final copy.

| Intent | Swedish Example |
|---|---|
| greeting / unclear start | "Hej! Jag kan hjälpa dig med mobilabonnemang, bredband, täckning, presentkort eller varukorgen. Vad vill du kika på först?" |
| browsing from ad | "Välkommen. Dealett hjälper dig se om ditt nuvarande abonnemang faktiskt går att slå efter pris, täckning, bindningstid och eventuell belöning. Du kan bara kika runt - jag börjar jämföra först när du vill." |
| direct recommendation | "Om jag måste välja utan mer info: börja med ett mellanstort 5G-abonnemang runt 20-30 GB. Det är en kvalificerad gissning, inte en exakt personlig rekommendation." |
| coverage/täckning | "Täckning går inte att garantera utan exakt plats, men vi kan komma nära. Inomhus, bostadens material och var du använder mobilen mest spelar stor roll." |
| coverage map request | "Absolut. Jag kan starta täckningskollen här i chatten. Exakt täckning behöver adress eller position och är alltid en uppskattning." |
| suspiciously low customer price | "Det låter som ett ovanligt starkt pris. Jag säger inte att det är fel, men innan jag jämför behöver jag veta om det är kampanj, familjepris, student/senior-rabatt, arbetsgivare eller winback." |
| campaign price uncertainty | "Då behöver vi räkna på priset efter kampanjen, annars kan ett billigt erbjudande se bättre ut än det är." |
| binding period | "Bindningstid kan göra ett byte olönsamt även om nya priset är lägre. Vi behöver räkna på eventuell dubbelkostnad innan vi rekommenderar byte." |
| highest reward request | "Jag kan visa högsta belöningen, men jag bör inte välja abonnemang bara efter presentkort. Ett dyrt abonnemang med stor belöning kan bli sämre totalt." |
| trust/bias/payment question | "Ja, Dealett kan få ersättning från partners om du väljer ett erbjudande. Men poängen är att vi också ska kunna säga när ditt nuvarande avtal verkar bättre. Annars bygger vi ingen tillit." |
| angry/frustrated customer | "Jag fattar. Abonnemang blir lätt rörigt. Vi kan göra det enkelt: jag hjälper dig antingen sänka priset, förbättra täckningen eller förstå fakturan." |
| confused/typo-heavy customer | "Jag är inte helt säker på vad du menar. Jag kan hjälpa dig med tre saker först: mobil, bredband eller täckning." |
| checkout / buy flow | "Jag hjälper dig vidare. Om erbjudandet redan är valt fortsätter vi i varukorgen för nummerflytt, kontaktuppgifter och signering." |
| explanation of recommendation | "Jag rekommenderar den för att den bäst matchar uppgifterna du gav: surfbehov, nuvarande pris, bindningstid och totalvärde med eventuell belöning." |

## Button Rules

Use buttons when they replace typing, lower anxiety, or help an unclear customer move forward.

Good button examples:

- `Mobilabonnemang`
- `Bredband hemma`
- `Täckning`
- `Billigast`
- `Bästa täckning`
- `Högsta presentkort`
- `Jag vet inte`
- `Använd min position`
- `Ange adress`
- `Jämför operatörer`
- `Gör mer träffsäkert`

Avoid buttons when:

- The user asked a trust question and needs a clear answer first.
- The user asks why an offer was recommended.
- The user needs exact legal/account information.
- Showing a button would hide uncertainty or imply a verified answer.

## Offer Card Rules

Offer cards should appear only after validation says an offer can be shown. A card should include:

- operator
- plan name
- data amount
- monthly price
- reward/presentkort if available
- binding information
- main reason
- CTA button

Do not show offer cards when:

- the customer price is suspiciously low and not clarified
- campaign length/normal price is unknown and materially affects comparison
- binding period may make switching bad
- the user asked about trust/bias/payment
- the user asked only to browse
- the user asked for legal/account support

## Embedded Widget Rules

Embedded chat widgets are the preferred middle ground between plain text and full page navigation.

| Widget | Use For |
|---|---|
| `coverage_selector` | Address/position/operator coverage choices. |
| `coverage_result` | Compact coverage result summary. |
| `operator_comparison` | Small operator comparison in chat. |
| `offer_cards` | Validated sellable offers. |
| `reward_comparison` | Comparing reward against total value. |
| `family_builder` | Number of users and family package structure. |
| `broadband_checker` | 5G broadband/home internet address check. |
| `cart_summary` | Compact current cart state. |

## Navigation Rules

Full page navigation should only happen when:

- checkout is due
- login/account is required
- exact legal terms are needed
- the user asks for full-screen coverage map
- the comparison is too complex for chat
- the user explicitly asks to open a page

Do not navigate when:

- the user is browsing from an ad
- the user asks a coverage question that can start with address/position buttons
- the user is confused
- the user is angry and needs reassurance
- the user asks why Dealett is paid or biased

## UX Scoring Rules

Good chat UX:

- Answers the user's actual question before asking for details when appropriate.
- Uses one question by default.
- Uses buttons to reduce effort.
- Keeps normal flows inside chat.
- Shows cards only after enough validated information exists.
- Explains uncertainty clearly.
- Says when the customer's current deal may be better.
- Does not optimize only for presentkort.
- Does not navigate away unless it is the right step.

Bad chat UX:

- Asks several questions at once.
- Restarts the flow after a follow-up.
- Sends the user to another page too early.
- Shows offer cards before validation.
- Treats suspiciously low prices as fake or ignores them.
- Gives guaranteed coverage.
- Hides Dealett's partner compensation.
- Optimizes for highest reward even when total value is worse.
- Forces exact information when an approximate answer is enough.

## Bad vs Good Examples

### Direct Recommendation

Bad:

> Vilken operatör har du idag?

Good:

> Om jag måste välja utan mer info: börja med ett mellanstort 5G-abonnemang runt 20-30 GB. Det är en kvalificerad gissning, inte en exakt personlig rekommendation. Vill du göra den mer träffsäker med en fråga?

### Coverage Map

Bad:

> Gå till täckningssidan.

Good:

> Jag kan starta täckningskollen här. Exakt täckning behöver adress eller position och är alltid en uppskattning.
>
> Buttons: `Använd min position`, `Ange adress`, `Jämför operatörer`

### Highest Presentkort

Bad:

> Här är erbjudandet med högst presentkort. Gå till checkout.

Good:

> Jag kan visa högsta belöningen, men jag bör inte välja abonnemang bara efter presentkort. Ett dyrt abonnemang med stor belöning kan bli sämre totalt.
>
> Buttons: `Högsta belöning`, `Bästa totalvärde`, `Billigast efter belöning`

### Suspicious Price

Bad:

> Det stämmer inte. Det finns inget sådant pris.

Good:

> Det låter som ett ovanligt starkt pris. Jag säger inte att det är fel, men innan jag jämför behöver jag veta om det är kampanj, familjepris, student/senior-rabatt, arbetsgivare eller winback.

### Angry Customer

Bad:

> För att hjälpa dig behöver jag veta operatör, pris, bindningstid, surf och antal abonnemang.

Good:

> Jag fattar. Abonnemang blir lätt rörigt. Vi kan göra det enkelt: vill du främst sänka priset, fixa täckning eller förstå fakturan?
