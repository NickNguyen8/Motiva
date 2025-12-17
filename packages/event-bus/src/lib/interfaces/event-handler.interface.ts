import { DomainEvent } from './domain-event.interface';

export interface EventHandler<T extends DomainEvent = DomainEvent> {
    handle(event: T): Promise<void>;
}
