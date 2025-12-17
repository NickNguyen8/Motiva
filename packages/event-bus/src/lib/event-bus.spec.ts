import { eventBus } from './event-bus';

describe('eventBus', () => {
  it('should work', () => {
    expect(eventBus()).toEqual('event-bus');
  });
});
