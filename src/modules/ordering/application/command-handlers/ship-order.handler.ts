import type { CommandHandler } from './command-handler.ts';
import type { EventStore } from '../ports/event-store.ts';
import { Order } from '../../domain/order/order.ts';
import { buildOrderStreamName } from '../streams/order.stream.ts';
import type { ShipOrderCommand } from '../commands/ship-order.command.ts';

export class ShipOrderHandler implements CommandHandler<ShipOrderCommand> {
  constructor(private readonly eventStore: EventStore) {}

  async execute(command: ShipOrderCommand): Promise<void> {
    const { orderId, shippedAt } = command;
    const streamName = buildOrderStreamName(orderId);

    const orderEvents = await this.eventStore.readFromStream(streamName);

    const order = Order.rehydrate(orderEvents);
    const placedOrder = order.ship({
      shippedAt,
    });

    await this.eventStore.appendToStream(
      streamName,
      placedOrder.getUncommittedChanges(),
    );
  }
}
