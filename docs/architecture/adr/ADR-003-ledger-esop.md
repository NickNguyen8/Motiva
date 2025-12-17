# ADR 003: Ledger-Based ESOP Data

## Context
Financial and equity data ("Who owns what", "Why did they get 100 points") must be auditable for an IPO. Regular CRUD "update" operations destroy history and are insufficient for financial integrity.

## Decision
We will use a **Ledger-Based (Append-Only)** database design for all financial tables (`PointLedger`, `InternalStockLedger`).
- **Rule**: Columns representing balances are never updated.
- **Method**: New rows are inserted for every change (`EARN`, `SPEND`, `ADJUST`). Current balance is `SUM(amount)`.
- **Snapshot**: Periodic snapshots (`TokenSnapshot`, `YearlyRewardSnapshot`) are used for read performance optimizaiton, but the Ledger is the source of truth.

## Consequences
### Positive
- **Auditability**: Complete history of every point earned is preserved. "Time travel" reporting is possible.
- **Integrity**: Harder to accidentally corrupt data via bad updates. Reprocessing/Replaying ledgers can fix downstream state.

### Negative
- **Storage**: Table size grows linearly with activity (mitigated by archiving).
- **Complexity**: Calculating current balance requires aggregation (mitigated by Snapshots).
