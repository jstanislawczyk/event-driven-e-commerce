import type { CommandHandler } from './command-handler.ts';
import type { PlaceOrderCommand } from '../commands/place-order.command.ts';
import type { EventStore } from '../ports/event-store.ts';
import { Order } from '../../domain/order/order.ts';
import type { CustomerReader } from '../ports/customer-reader.ts';
import type { AuthorizePaymentCommand } from '../commands/authorize-payment.command.ts';
import { buildOrderStreamName } from '../streams/order.stream.ts';

export class AuthorizePaymentHandler implements CommandHandler<AuthorizePaymentCommand> {
  constructor(private readonly eventStore: EventStore) {}

  async execute(command: AuthorizePaymentCommand): Promise<void> {
    const { orderId, paymentId, authorizedAt } = command;
    const streamName = buildOrderStreamName(orderId);

    const orderEvents = await this.eventStore.readFromStream(streamName);

    const order = Order.rehydrate(orderEvents);
    const placedOrder = order.authorizePayment({
      paymentId,
      authorizedAt,
    });

    await this.eventStore.appendToStream(
      streamName,
      placedOrder.getUncommittedChanges(),
    );
  }
}
