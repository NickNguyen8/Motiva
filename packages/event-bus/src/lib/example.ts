
/**
 * Example Usage of Event Bus
 */

import { DomainEvent } from './interfaces/domain-event.interface';
import { EventHandler } from './interfaces/event-handler.interface';
import { EventsHandler } from './event-bus.module';

// 1. Define an Event
export class UserCreatedEvent implements DomainEvent {
    static readonly eventName = 'UserCreated'; // Used for binding
    readonly eventName = UserCreatedEvent.eventName;
    readonly eventVersion = 1;

    constructor(
        public readonly eventId: string,
        public readonly occurredOn: Date,
        public readonly aggregateId: string,
        public readonly email: string,
    ) { }
}

// 2. Define a Handler
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements EventHandler<UserCreatedEvent> {
    async handle(event: UserCreatedEvent): Promise<void> {
        console.log(`[UserCreatedHandler] Processing user: ${event.email}`);
    }
}
