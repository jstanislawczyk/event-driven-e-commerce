import type { CommandHandler } from './command-handler.ts';
import type { EventStore } from '../ports/event-store.ts';
import { Order } from '../../domain/order/order.ts';
import { buildOrderStreamName } from '../streams/order.stream.ts';
import type { DeliverOrderCommand } from '../commands/deliver-order.command.ts';

export class DeliverOrderHandler implements CommandHandler<DeliverOrderCommand> {
  constructor(private readonly eventStore: EventStore) {}

  async execute(command: DeliverOrderCommand): Promise<void> {
    const { orderId, deliveredAt } = command;
    const streamName = buildOrderStreamName(orderId);

    const orderEvents = await this.eventStore.readFromStream(streamName);

    const order = Order.rehydrate(orderEvents);
    const deliveredOrder = order.deliver({
      deliveredAt,
    });

    await this.eventStore.appendToStream(
      streamName,
      deliveredOrder.getUncommittedChanges(),
    );
  }
}
