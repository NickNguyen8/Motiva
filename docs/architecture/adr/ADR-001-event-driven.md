# ADR 001: Event-Driven Architecture

## Context
Motiva requires a highly scalable and decoupled system where user actions (Contributions) trigger multiple independent downstream effects (Rewards, Notifications, Analytics) without tight coupling.

## Decision
We will use an **Event-Driven Architecture (EDA)** for inter-module communication.
- **Core Mechanism**: `packages/event-bus` (Interface definition + In-Memory/Redis implementation).
- **Pattern**: Modules emit `DomainEvent`s. Handlers subscribe to these events.
- **Constraint**: No direct synchronous calls between bounded contexts (e.g., `Contribution` module never calls `RewardService` directly).

## Consequences
### Positive
- **Decoupling**: Modules can be developed, tested, and scaled independently.
- **Extensibility**: Adding a new reactor (e.g., "Send Slack message on Reward") requires no changes to the emitter.
- **Resilience**: Failures in consumers (e.g., Notification service down) do not block the producer (User flow).

### Negative
- **Complexity**: Debugging requiring tracing flows across events.
- **Consistency**: Relies on eventual consistency rather than ACID transactions across modules.
