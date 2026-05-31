# Market Update Report

Run ID: 2026-05-31T17-51-29-121Z
Fetched at: 2026-05-31T17:51:29.123Z
Apply mode: disabled

## Collector Results

| Operator | Status | Raw plans | Source URL |
|---|---|---:|---|
| telia | not_implemented | 0 | https://www.telia.se |
| tele2 | not_implemented | 0 | https://www.tele2.se |
| telenor | not_implemented | 0 | https://www.telenor.se |
| tre | not_implemented | 0 | https://www.tre.se |
| halebop | not_implemented | 0 | https://www.halebop.se |

## Normalized Output

- Normalized plans: 0
- Operators: telia, tele2, telenor, tre, halebop

## Merge Summary

- New plans: 0
- Changed plans: 0
- Removed/missing plans: 20
- Blocked verified overwrites: 0
- data/plans.json written: no

## New Plans

| Operator | Plan ID | Plan name |
|---|---|---|
| none | none | none |

## Changed Plans

| Operator | Plan ID | Plan name | Changed fields |
|---|---|---|---|
| none | none | none | none |

## Removed Or Missing Plans

| Operator | Plan ID | Plan name | Current status |
|---|---|---|---|
| tele2 | tele2-low | 10 GB | placeholder |
| tele2 | tele2-medium | 40 GB | placeholder |
| tele2 | tele2-unlimited | Obegränsad | placeholder |
| tele2 | tele2-family-addon | Lägg till familjemedlem | placeholder |
| telia | telia-low | 10 GB | placeholder |
| telia | telia-medium | 30 GB | placeholder |
| telia | telia-unlimited | Obegränsad Plus | placeholder |
| telia | telia-family-addon | Lägg till familjemedlem | placeholder |
| telenor | telenor-low | 10 GB | placeholder |
| telenor | telenor-medium | 30 GB | placeholder |
| telenor | telenor-unlimited | Obegränsad | placeholder |
| telenor | telenor-family-addon | Lägg till familjemedlem | placeholder |
| tre | tre-low | 6 GB | placeholder |
| tre | tre-medium | 25 GB | placeholder |
| tre | tre-unlimited | Obegränsad | placeholder |
| tre | tre-family-addon | Lägg till familjemedlem | placeholder |
| halebop | halebop-low | 3 GB | placeholder |
| halebop | halebop-high | 8 GB | placeholder |
| halebop | halebop-medium | 100 GB | placeholder |
| halebop | halebop-family-addon | Lägg till familjemedlem | placeholder |

## Blocked Verified Overwrites

| Operator | Plan ID | Plan name | Reason |
|---|---|---|---|
| none | none | none | none |

## Notes

- Collectors are placeholders and do not scrape yet.
- Normalized rows are never marked verified automatically.
- `MARKET_APPLY=true` is required before the pipeline can write to `data/plans.json`.
- Even in apply mode, verified rows are not overwritten automatically.
