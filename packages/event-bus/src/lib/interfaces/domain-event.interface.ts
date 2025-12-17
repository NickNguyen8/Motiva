export interface DomainEvent {
    // Unique identifier for deduplication/idempotency
    readonly eventId: string;
    // When did it happen?
    readonly occurredOn: Date;
    // Which aggregate root does this belong to?
    readonly aggregateId: string;
    // Versioning for schema evolution
    readonly eventVersion: number;

    // Name of the event (e.g., 'UserRegistered')
    readonly eventName: string;
}
