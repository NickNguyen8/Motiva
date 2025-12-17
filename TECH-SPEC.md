# Technical Specification

## 1. Architecture Overview

Motiva operates as a **Modular Monolith** with an Event-Driven core.

### Components
- **API (`apps/api`)**: NestJS Gateway. Handles REST requests, authenticates users, and dispatches Commands/Events.
- **Worker (`apps/worker`)**: NestJS Background Service. Consumes events (e.g., `RewardCalculated`), processes heavy lifting (Blockchain minting), and handles Cron jobs.
- **Web (`apps/web`)**: Next.js App Router. User dashboard for viewing profile, contributions, and equity.
- **Smart Contracts (`packages/blockchain`)**: Solidity contracts defining the `MTS` token.

---

## 2. Event Flow

### Scenario: Contribution to Equity
1.  **Ingest**: User opens a PR. Webhook hits `API`.
2.  **Process**: `ContributionModule` analyzes PR, stores as `PENDING`.
3.  **Approval**: Manager approves. `ContributionModule` emits `ContributionApproved(userId, id)`.
4.  **Reward**: `RewardModule` (Listener) receives event.
    *   Calculates points based on active `RewardRule`.
    *   Writes `PointLedger` entry (+100 Points).
    *   Emits `PointsIssued(userId, 100)`.
5.  **Notify**: `NotificationModule` sends Slack/Email.
6.  **Review (Year End)**: `TokenEngine` (Cron) triggers `ProcessYearlyConversion`.
    *   Reads `PointLedger`.
    *   Applies Revenue/Growth coefficients.
    *   Writes `PointLedger` entry (-100 Points, `CONVERT`).
    *   Emits `MintingRequested`.
7.  **Mint**: `Worker` receives `MintingRequested`.
    *   Calls `ESOPToken.mint()` on blockchain.
    *   Emits `MintingCompleted`.

---

## 3. ESOP Lifecycle

### Phase 1: Contribution
- **Input**: Work (Code, Design, Strategy).
- **Unit**: Points (Off-chain, high velocity).
- **Storage**: `PointLedger`.

### Phase 2: Vesting/Conversion
- **Trigger**: Annual Performance Review.
- **Logic**: Points $\to$ Tokens.
- **Adjusters**: Company Revenue, Growth, Individual Performance.

### Phase 3: Equity
- **Unit**: MTS Tokens (On-chain, ERC-20).
- **Rights**: Dividend/Bonus rights (via `BonusModule`), Voting rights (Governance).

---

## 4. IPO Upgrade Path

### Current State (Private)
- **Token**: Restricted transferability (Smart Contract whitelist or UI blocking).
- **Value**: Internal valuation based on last funding round.
- **Liquidity**: Internal buyback events.

### Pre-IPO
- **Audit**: `PointLedger` and `InternalStockLedger` provided to auditors to verify Cap Table.
- **KYC**: Ensure all `walletAddress` mappings are verified identities.

### IPO / Public Listing
- **Upgrade**: `DEFAULT_ADMIN` upgrades `ESOPToken` contract (UUPS) to remove transfer restrictions.
- **Listing**: Tokens become tradeable on public DEX/CEX.
- **Legacy**: Off-chain `PointLedger` remains for future performance cycles, continuing to feed the public token supply.
