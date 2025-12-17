# Token Engine Design

**Responsibility**: Converting off-chain `Points` into on-chain `MTS` (Motiva Stock) tokens based on company performance.

## 1. Mathematical Formulas

The conversion uses a **Performance-Adjusted Allocation** model.

### Variables
- $P_u$: User's Total Points earned in the active period (e.g., Year 2025).
- $R_{actual}$: Actual Company Revenue.
- $R_{target}$: Target Company Revenue.
- $G_{actual}$: Actual YoY Growth %.
- $G_{target}$: Target YoY Growth %.
- $C_{base}$: Base Conversion Rate (e.g., 1 Point = 1 Token).

### Coefficients
1. **Revenue Coefficient ($K_r$)**:
   $$K_r = \min(CAP_r, \frac{R_{actual}}{R_{target}})$$
   *Encourages hitting revenue targets. Capped to prevent runaway dilution.*

2. **Growth Coefficient ($K_g$)**:
   $$K_g = 1 + (\alpha \times (G_{actual} - G_{target}))$$
   *Where $\alpha$ is the growth sensitivity factor (e.g., 0.5). If growth is below target, this can reduce the grant.*

### Final Formula
$$Tokens_{grant} = P_u \times C_{base} \times K_r \times K_g$$

---

## 2. Configurable Parameters (Database/Env)

Stored in a `TokenEngineConfig` or distinct `RewardRuleVersion`.

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `active_year` | Int | 2025 | The fiscal year being processed. |
| `base_conversion_rate` | Decimal | 1.0 | Baseline 1 Point = 1 Token. |
| `target_revenue` | Decimal | 10,000,000 | $10M target. |
| `target_growth_percent` | Decimal | 0.20 | 20% YoY growth target. |
| `revenue_cap` | Decimal | 1.5 | Max 1.5x multiplier for revenue. |
| `growth_sensitivity` | Decimal | 0.5 | Impact of missing/exceeding growth target. |

---

## 3. Events

### Consumed
- **`Reward.YearlyReviewFinalized`**: Triggered when HR/Admin finalizes the points for the year.
  - Payload: `{ year: 2025 }` (Engine will query the DB for all users).

### Emitted
- **`TokenEngine.MintingRequested`**: Request mainly to the `apps/worker` to execute blockchain tx.
  - Payload: `{ userId, walletAddress, amount, referenceId }`
- **`TokenEngine.MintingCompleted`**: Emitted after blockchain confirmation.
  - Payload: `{ userId, txHash, blockNumber }`

---

## 4. Pseudo-Code (NestJS implementation)

```typescript
@Injectable()
export class TokenEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventPublisher,
    private readonly configService: ConfigService
  ) {}

  // Triggered by 'Reward.YearlyReviewFinalized' or Manual Cron
  async processYearlyConversion(year: number) {
    // 1. Fetch Company Performance Config
    const config = await this.prisma.tokenConfig.findUnique({ where: { year } });
    const { kR, kG } = this.calculateCoefficients(config);

    // 2. Fetch all users with points for the year
    const users = await this.prisma.yearlyRewardSnapshot.findMany({
      where: { year, isConverted: false }
    });

    for (const user of users) {
      if (!user.walletAddress) {
        this.logger.warn(`User ${user.id} has no wallet. Skipping.`);
        continue;
      }

      // 3. Calculate Grant
      const points = user.totalPointsEarned;
      const tokenAmount = points * config.baseRate * kR * kG;

      // 4. Create Ledger Entry (Off-chain record of "Pending Mint")
      const ledgerEntry = await this.prisma.pointLedger.create({
        data: {
          userId: user.id,
          amount: -points, // Deduct points (they are being converted)
          transactionType: 'CONVERT_TO_TOKEN',
          reason: `Yearly Conversion ${year}`,
        }
      });

      // 5. Emit Event for Worker to pick up (Async Blockchain Op)
      await this.eventBus.publish(new TokenMintingRequestedEvent({
         userId: user.id,
         walletAddress: user.walletAddress,
         amount: tokenAmount,
         conversionReferenceId: ledgerEntry.id
      }));
    }
  }

  private calculateCoefficients(config: TokenConfig) {
    const kR = Math.min(config.revenueCap, config.actualRevenue / config.targetRevenue);
    
    // Growth delta: e.g. 25% actual - 20% target = 0.05
    const growthDelta = config.actualGrowth - config.targetGrowth;
    const kG = 1 + (config.growthSensitivity * growthDelta);

    return { kR, kG };
  }
}
```

---

## 5. Security & Audibility
- **Double Entry**: Deduct Points in `PointLedger`, Add Tokens in blockchain.
- **Traceability**: The `conversionReferenceId` links the blockchain transaction (mint) back to the off-chain ledger deduction.
- **Fail-Safe**: If minting fails, the `worker` emits `MintingFailed`. A compensation transaction (reverse the deduction) or a retry mechanism must be triggered.
