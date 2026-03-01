import type { CommandHandler } from './command-handler.ts';
import type { PlaceOrderCommand } from '../commands/place-order.command.ts';
import type { EventStore } from '../ports/event-store.ts';
import { Order } from '../../domain/order/order.ts';
import type { CustomerReader } from '../ports/customer-reader.ts';

export class PlaceOrderHandler implements CommandHandler<PlaceOrderCommand> {
  constructor(
    private readonly eventStore: EventStore,
    private readonly customerReader: CustomerReader,
  ) {}

  async execute(command: PlaceOrderCommand): Promise<void> {
    const { orderId, customerId, items } = command;

    const customerExists = await this.customerReader.exists(customerId);

    if (!customerExists) {
      throw new Error(`Customer with ID ${customerId} does not exist.`);
    }

    const streamName = `order-${command.orderId}`;
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
