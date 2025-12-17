# Backend Domain Design

This document outlines the architecture for the core backend modules of Motiva.
Architecture: **Event-Driven**, **DDD-lite**, **Modular Monolith**.

## Standard Module Structure
Each module (e.g., `apps/api/src/modules/auth`) follows this structure:
```
module-name/
├── domain/                  # Enterprise business rules
│   ├── entities/            # Domain entities
│   ├── events/              # Domain events definitions
│   ├── ports/               # Interfaces for repositories/services
│   └── value-objects/       # Value objects
├── application/             # Application business rules
│   ├── commands/            # CQRS Write side
│   ├── queries/             # CQRS Read side
│   └── event-handlers/      # Handlers for domain/integration events
├── infrastructure/          # Frameworks & Drivers
│   ├── adapters/            # Implementations of ports (Repositories)
│   ├── persistence/         # ORM schemas/mappers
│   └── strategies/          # Auth strategies, etc.
└── presentation/            # Interface Adapters
    ├── controllers/         # HTTP Controllers
    ├── dtos/                # Data Transfer Objects
    └── consumers/           # Message/Event consumers
```

---

## 1. Auth Module
**Responsibilities**:
- User Registration (Sign up)
- Authentication (Login, JWT issuance)
- Authorization (RBAC/ACL checks)
- Identity verification

**Events Produced**:
- `UserRegistered`
- `UserLoggedIn`
- `PasswordResetRequested`

**Events Consumed**:
- None (Core dependency)

## 2. User Module
**Responsibilities**:
- User Profile management (Avatar, Bio)
- Role management
- Team/Department association
- KYC Status tracking

**Events Produced**:
- `UserProfileUpdated`
- `UserRoleChanged`
- `UserDeactivated`

**Events Consumed**:
- `Auth.UserRegistered` -> Create initial profile

## 3. Contribution Module
**Responsibilities**:
- Ingesting activity (GitHub PRs, Jira tickets)
- Manual contribution logging
- Contribution verification/approval workflow

**Events Produced**:
- `ContributionCreated`
- `ContributionApproved` (Triggers Reward)
- `ContributionRejected`

**Events Consumed**:
- `User.UserDeactivated` -> Flag pending contributions

## 4. Reward Module
**Responsibilities**:
- Calculating points/tokens for approved contributions
- Managing reward rules/formulas
- Issuing "Points" (off-chain intermediate currency)

**Events Produced**:
- `RewardCalculated`
- `PointsIssued`

**Events Consumed**:
- `Contribution.ContributionApproved` -> Calculate & Issue Reward

## 5. Token Engine Module
**Responsibilities**:
- Blockchain interaction (ERC-20 Mint/Transfer)
- Wallet management (Mapping User ID <-> Wallet Address)
- Conversion of "Points" to "Tokens" (Vesting/Minting)

**Events Produced**:
- `WalletCreated`
- `TokensMinted`
- `TokensTransferred`

**Events Consumed**:
- `Reward.PointsIssued` -> (Optional) Real-time minting or batch minting
- `Auth.UserRegistered` -> Create Wallet Address (Async)

## 6. Internal Stock Module
**Responsibilities**:
- Managing ESOP/RSU grants (Off-chain ledger)
- Vesting schedules engine
- Stock option exercises

**Events Produced**:
- `StockGrantIssued`
- `StockVested`
- `StockExercised`

**Events Consumed**:
- `User.UserRoleChanged` -> Adjust grants (if rule exists)

## 7. Bonus Module
**Responsibilities**:
- Spot bonuses (Manager to peer)
- Special event bonuses (Holidays, Launch)
- Approval workflows for large bonuses

**Events Produced**:
- `BonusNominated`
- `BonusApproved`

**Events Consumed**:
- None (Mostly initiated via API)

## 8. Notification Module
**Responsibilities**:
- Delivering alerts (Email, Slack, Push)
- Managing user notification preferences
- Templating messages

**Events Produced**:
- `NotificationSent`
- `NotificationFailed`

**Events Consumed**:
- `Auth.*` (Welcome email, Password reset)
- `Contribution.ContributionApproved`
- `Reward.PointsIssued`
- `TokenEngine.TokensMinted`
- `Stock.*`

---

## Event Flow Example: Contribution to Reward
1. **User** submits work -> **Contribution Module** creates record.
2. Manager approves -> **Contribution Module** emits `ContributionApproved`.
3. **Reward Module** listens to `ContributionApproved`.
4. **Reward Module** calculates value, adds points -> emits `PointsIssued`.
5. **Notification Module** listens to `PointsIssued` -> sends "You got points!" email.
6. (Optional/Batch) **Token Engine** listens to `PointsIssued` -> mints on-chain tokens.

