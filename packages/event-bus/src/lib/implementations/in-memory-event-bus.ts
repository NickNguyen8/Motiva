import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomainEvent } from '../interfaces/domain-event.interface';
import { EventPublisher } from '../interfaces/event-publisher.interface';
import { EventHandler } from '../interfaces/event-handler.interface';

@Injectable()
export class InMemoryEventBus implements EventPublisher, OnModuleDestroy {
    private readonly logger = new Logger(InMemoryEventBus.name);
    private readonly subject$ = new Subject<DomainEvent>();
    private readonly subscriptions: Subscription[] = [];

    async publish(event: DomainEvent): Promise<void> {
        this.logger.debug(`Publishing event: ${event.eventName} (${event.eventId})`);
        this.subject$.next(event);
    }

    async publishAll(events: DomainEvent[]): Promise<void> {
        for (const event of events) {
            await this.publish(event);
        }
    }

    /**
     * Register a handler for a specific event name.
     * Note: logic for mapping classes to names is kept simple here.
     */
    register(eventName: string, handler: EventHandler): void {
        const sub = this.subject$
            .pipe(filter((event) => event.eventName === eventName))
            .subscribe({
                next: async (event) => {
                    try {
                        await handler.handle(event);
                    } catch (error) {
                        this.logger.error(
                            `Error handling event ${event.eventName} in ${handler.constructor.name}:`,
                            error
                        );
                    }
                },
            });
        this.subscriptions.push(sub);
    }

    onModuleDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
