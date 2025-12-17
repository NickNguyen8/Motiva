# Bonus Distribution System Design

**Responsibility**: Calculation and distribution of profit-sharing bonuses based on ownership ("Skin in the game").

## 1. Core Principles
- **Meritocracy**: Bonuses are distributed based on the *effective ownership* a user has in the platform.
- **Weighted Ownership**: Internal Stock (vested or unvested RSU/Options) carries a higher weight than liquid Tokens, encouraging long-term retention.
- **Auditability**: Every calculation snapshot is stored.

## 2. Mathematical Formulas

### Variables
- $P_{total}$: Total Bonus Pool (e.g., $1,000,000 or 1M Points).
- $T_u$: User's Liquid Token Balance (ERC-20).
- $S_u$: User's Internal Stock Balance (Vested + Unvested).
- $W_s$: Stock Weight Multiplier (e.g., 2.0x). Stock is "heavier" than tokens.

### Effective Shares ($E_u$)
The "Effective Share" represents the user's claim on the pool.
$$E_u = T_u + (S_u \times W_s)$$

### Total Effective Shares ($E_{total}$)
$$E_{total} = \sum_{i=1}^{n} E_{u_i}$$

### User Bonus ($B_u$)
$$B_u = P_{total} \times \frac{E_u}{E_{total}}$$

---

## 3. Distribution Flow

1.  **Trigger**: Admin initiates "Q3 Profit Share" with Pool Amount $X$.
2.  **Snapshot**: System takes a snapshot of:
    *   All user Token balances (`TokenSnapshot`).
    *   All user Stock balances (`InternalStockLedger` summation).
3.  **Calculation**:
    *   Compute $E_u$ for every eligible user.
    *   Compute $E_{total}$.
    *   Calculate $B_u$.
4.  **Verification**: Admin reviews the distribution preview (Top 50 recipients, total check).
5.  **Execution**:
    *   Create `BonusSnapshot` record (Metadata).
    *   Write **PointLedger** entries for each user:
        *   `amount`: $+B_u$
        *   `reason`: "Q3 Profit Share"
        *   `referenceId`: `BonusSnapshot.id`
    *   Emit `BonusDistributed` event.

---

## 4. Edge Cases

1.  **Zero Denominator**: If $E_{total} = 0$ (No users have tokens or stock), distribution aborts.
2.  **Dust Amounts**: If $B_u < 0.01$ (or min threshold), the bonus is skipped for that user to save ledger noise.
3.  **Excluded Users**: Terminated users (Status = TERMINATED) in `EmployeeProfile` are excluded from the snapshot query.
4.  **Race Conditions**: The snapshot prevents race conditions. Balances changing *during* the calculation do not affect the result for that run.

---

## 5. Events

### Emitted
- **`Bonus.DistributionCalculated`**:
  - Payload: `{ bonusId, totalEffectiveShares, recipientCount }`
  - Purpose: Notify Admin to review.

- **`Bonus.DistributionExecuted`**:
  - Payload: `{ bonusId, totalAmount, timestamp }`
  - Purpose: Notify Notification Module (Email users "You got a bonus!").

---

## 6. Audit Trail
- The `BonusSnapshot` table stores the aggregate data.
- The `AuditLog` stores the specific configuration used for the run (e.g., $W_s$ value).
- Each user's receipt is immutable in `PointLedger`.
