import { Module, Global, Inject, OnApplicationBootstrap, Type } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InMemoryEventBus } from './implementations/in-memory-event-bus';
import { EventHandler } from './interfaces/event-handler.interface';

export const EVENT_BUS_TOKEN = 'EVENT_BUS_TOKEN';
export const EVENT_HANDLER_METADATA = 'EVENT_HANDLER_METADATA';

/**
 * Decorator to mark a class as an event handler
 */
export function EventsHandler(event: Type<{ eventName: string }>): ClassDecorator {
    return (target: object) => {
        // We assume the event class has a static 'eventName' property or instantiated definition
        // For simplicity in this decorator, we just store the event constructor.
        // In a real app we might instantiate to get the name, or rely on a static prop.
        Reflector.createDecorator<Type<{ eventName: string }>>()(event);
        Reflect.defineMetadata(EVENT_HANDLER_METADATA, event, target);
    };
}

@Global()
@Module({
    imports: [DiscoveryModule],
    providers: [
        {
            provide: EVENT_BUS_TOKEN,
            useClass: InMemoryEventBus,
        },
        InMemoryEventBus, // Also provide concrete for internal mapping if needed
    ],
    exports: [EVENT_BUS_TOKEN],
})
export class EventBusModule implements OnApplicationBootstrap {
    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        @Inject(EVENT_BUS_TOKEN) private readonly eventBus: InMemoryEventBus,
    ) { }

    onApplicationBootstrap() {
        this.registerHandlers();
    }

    private registerHandlers() {
        const wrappers = this.discoveryService.getProviders();

        wrappers.forEach((wrapper) => {
            const { instance, metatype } = wrapper;
            if (!instance || !metatype) {
                return;
            }

            const eventConstructor = Reflect.getMetadata(EVENT_HANDLER_METADATA, metatype);

            if (eventConstructor) {
                // Assume eventConstructor has a static or prototype property 'eventName'? 
                // Or we instantiate it?
                // For type safety in this demo, let's look for a static 'eventName' or standard mapping.
                // If strict class checks are needed, we'd need a map.
                // Here we'll try to get the 'eventName' from the prototype or static property.

                let eventName = (eventConstructor as any).eventName || (eventConstructor as any).name;

                // If the user implemented 'readonly eventName = "XYZ"' on the class instance, 
                // we might not see it statically. Ideally DomainEvents are simple DTOs.
                // Let's assume the event class name IS the event name for simplicity unless overridden.

                this.eventBus.register(eventName, instance as EventHandler);
            }
        });
    }
}
