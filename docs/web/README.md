# Motiva Web Application

The frontend dashboard for Motiva employees to view their equity, contributions, and rewards.

## Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router).
- **Library**: React 19.
- **Styling**: Vanilla CSS Modules (Standard).
- **Testing**: Jest (Unit), Cypress (E2E).

## Folder Structure

```
apps/web/src/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── layout.tsx        # Root layout (Auth check, Navigation)
│   ├── page.tsx          # Landing page
│   ├── dashboard/        # Main user dashboard
│   ├── profile/          # User settings & wallet mapping
│   └── portfolio/        # Equity visualization (Points, Stock, Token)
├── components/           # Reusable UI components
│   ├── ui/               # Basic atoms (Button, Card, Input)
│   └── business/         # Domain components (GrantCard, PointHistory)
├── lib/                  # Utilities (API client, Formatters)
└── specs/                # Unit tests
```

## Key Features

### 1. Authentication
- Integration with `apps/api` via JWT (HttpOnly cookies preferred).
- Middleware protection for routes under `/dashboard`.

### 2. Dashboard
- **"My Equity"**: Real-time view of `Effective Shares`.
- **"Recent Activity"**: Stream of User's `PointLedger` events.
- **"Contributions"**: List of ingested PRs/Tickets with status.

### 3. Portfolio
- Visualization of the user's vesting schedule using `InternalStockLedger`.
- Connection to Web3 wallet (e.g., MetaMask) to view on-chain `MTS` tokens.

## Development

```bash
# Run locally
pnpm exec nx serve web

# Run tests
pnpm exec nx test web
pnpm exec nx e2e web-e2e
```

## Design System

We use a **System UI** approach with CSS variables for theming.
See `apps/web/src/app/global.css` for defined tokens:
- `--font-sans`
- `--color-primary`
- `--color-background`
- `--color-surface`
