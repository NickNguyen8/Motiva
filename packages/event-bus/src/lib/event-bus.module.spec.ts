import { Test, TestingModule } from '@nestjs/testing';
import { EventBusModule, EVENT_BUS_TOKEN } from './event-bus.module';
import { InMemoryEventBus } from './implementations/in-memory-event-bus';
import { EventHandler } from './interfaces/event-handler.interface';
import { EventsHandler } from './event-bus.module';
import { DomainEvent } from './interfaces/domain-event.interface';

// Mock Event
class MockEvent implements DomainEvent {
    static readonly eventName = 'MockEvent';
    readonly eventName = MockEvent.eventName;
    readonly eventVersion = 1;
    constructor(public readonly eventId: string, public readonly occurredOn: Date, public readonly aggregateId: string) { }
}

// Mock Handler
@EventsHandler(MockEvent)
class MockEventHandler implements EventHandler<MockEvent> {
    static handleCalled = false;
    async handle(event: MockEvent): Promise<void> {
        MockEventHandler.handleCalled = true;
    }
}

describe('EventBusModule', () => {
    let bus: InMemoryEventBus;

    beforeEach(async () => {
        MockEventHandler.handleCalled = false;
        const module: TestingModule = await Test.createTestingModule({
            imports: [EventBusModule],
            providers: [MockEventHandler],
        }).compile();

        module.enableShutdownHooks();
        await module.init();

        bus = module.get<InMemoryEventBus>(EVENT_BUS_TOKEN);
    });

    it('should dispatch events to the handler', async () => {
        const event = new MockEvent('1', new Date(), 'agg-1');
        await bus.publish(event);

        // Give a small tick for async simple subject if needed, though handle is async awaited in publish in my impl?
        // Waiting for next tick just in case
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(MockEventHandler.handleCalled).toBe(true);
    });
});
