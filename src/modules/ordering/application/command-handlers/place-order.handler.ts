import type { CommandHandler } from './command-handler.ts';
import type { PlaceOrderCommand } from '../commands/place-order.command.ts';
import type { EventStore } from '../ports/event-store.ts';
import { Order } from '../../domain/order/order.ts';

export class PlaceOrderHandler implements CommandHandler<PlaceOrderCommand> {
  constructor(private readonly eventStore: EventStore) {}

  async execute(command: PlaceOrderCommand): Promise<void> {
    const streamName = `order-${command.orderId}`;
    const { orderId, customerId, items } = command;
    const order = new Order(command.orderId, command.customerId);
    const placedOrder = order.placeOrder({
      orderId,
      customerId,
      items,
    });

    await this.eventStore.appendToStream(
      streamName,
      placedOrder.getUncommittedChanges(),
    );
  }
}
