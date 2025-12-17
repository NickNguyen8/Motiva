# Motiva

**Production-grade, IPO-ready Internal ESOP Platform.**

Motiva is an internal Employee Stock Ownership Plan (ESOP) platform designed to transparently track contributions, reward performance with points, and convert those points into blockchain-based equity tokens. It is built with an IPO-ready audit trail, ensuring every grant, bonus, and vesting event is immutable and verifiable.

## Key Features

- **Meritocratic Ownership**: Employees earn "Effective Shares" through contributions (PRs, Tickets) and tenure.
- **Event-Driven Architecture**: Decoupled modules (Auth, User, Contribution, Reward) communicate asynchronously for scalability.
- **Ledger-Based Interior**: Strict append-only SQL ledgers (`PointLedger`, `InternalStockLedger`) ensure financial integrity.
- **Blockchain-Backed**: Final equity is represented as ERC-20 `MTS` (Motiva Stock) tokens, mintable only via verified backend workflows.
- **Fair Bonus Distribution**: Profit-sharing pools are distributed based on a weighted mix of liquid tokens and vested stock.

## Tech Stack

- **Monorepo**: Nx
- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js (App Router), CSS Modules
- **Blockchain**: Solidity (ERC-20 UUPS Upgradeable), Hardhat
- **Infrastructure**: Docker, AWS (Planned)

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Database Setup**
   ```bash
   # Ensure Docker is running for Postgres if using local container
   pnpm exec nx run api:db:migrate
   ```

3. **Run Applications**
   ```bash
   pnpm exec nx run-many --target=serve --projects=api,web,worker
   ```

## Documentation

- [Technical Specification](TECH-SPEC.md)
- [Architecture Decisions (ADRs)](docs/architecture/adr/)
- [Domain Modules](docs/architecture/backend_domains.md)
- [Database Schema](docs/architecture/database_schema.md)
