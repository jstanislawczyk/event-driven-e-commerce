import type { CommandHandler } from './command-handler.ts';
import type { PlaceOrderCommand } from '../commands/place-order.command.ts';
import type { DomainEvent, EventStore } from '../ports/event-store.ts';

export class PlaceOrderHandler implements CommandHandler<PlaceOrderCommand> {
  constructor(private readonly eventStore: EventStore) {}

  async execute(command: PlaceOrderCommand): Promise<void> {
    const streamName = `order-${command.orderId}`;

    const placeOrderEvent: DomainEvent = {
      type: 'PLACE_ORDER',
      data: {
        orderId: command.orderId,
        customerId: command.customerId,
        items: command.items,
      },
    };

    await this.eventStore.appendToStream(streamName, [placeOrderEvent]);
  }
}
