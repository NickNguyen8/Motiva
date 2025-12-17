import { DomainEvent } from './domain-event.interface';

export interface EventPublisher {
    /**
     * Publish a single event
     */
    publish(event: DomainEvent): Promise<void>;

    /**
     * Publish multiple events (atomic batch if supported by infra)
     */
    publishAll(events: DomainEvent[]): Promise<void>;
}
