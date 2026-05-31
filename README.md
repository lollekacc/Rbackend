# Rbackend

## Dealett Market Intelligence

Dealett AI uses a separated market-data model so it can reason about Swedish telecom claims without confusing public market knowledge with offers Dealett can actually sell.

### Data Files

- `data/operators.json` is the broad Swedish telecom market reference. It contains operator-level facts such as brand type, network used, supported customer segments, 5G/eSIM support flags and verification status.
- `data/plans.json` is public market intelligence at plan level. It supports private, family, student, senior, youth, child and business plan structures. Existing runtime rows are marked `placeholder`; they must not be treated as verified market prices.
- `data/partner-offers.json` is only for Dealett sellable offers. Rows should stay inactive until the operator, plan, reward and source have been verified.
- `data/market-rules.json` defines claim-classification rules and placeholder heuristic ranges for judging customer price claims. These ranges are not real offers.

### AI Behavior Rules

Dealett AI should use this data for judgment, not accusation. If a customer claims a very low price, the assistant should never say the customer is lying. It should ask whether the price is a campaign, family/shared plan, student discount, senior discount, employer-paid plan, old retained contract, bundled discount or temporary winback offer.

If the customer already has a clearly better deal than Dealett can beat, Dealett AI should say that keeping the current deal may be the best consumer-side advice.

### Maintenance

Prices, segments, plan details, reward amounts and source URLs must be updated regularly. Placeholder values are allowed for structure and development. Fake verified prices are not allowed. Only mark data as `verified` when the row has a current source URL and has been manually checked.

### Commands

```bash
npm run validate:market
npm run test:market
```
