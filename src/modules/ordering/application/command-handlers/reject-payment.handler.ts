import type { CommandHandler } from './command-handler.ts';
import type { EventStore } from '../ports/event-store.ts';
import { Order } from '../../domain/order/order.ts';
import { buildOrderStreamName } from '../streams/order.stream.ts';
import type { RejectPaymentCommand } from '../commands/reject-payment.command.ts';

export class RejectPaymentHandler implements CommandHandler<RejectPaymentCommand> {
  constructor(private readonly eventStore: EventStore) {}

  async execute(command: RejectPaymentCommand): Promise<void> {
    const { orderId, paymentId } = command;
    const streamName = buildOrderStreamName(orderId);

    const orderEvents = await this.eventStore.readFromStream(streamName);

    const order = Order.rehydrate(orderEvents);
    const placedOrder = order.rejectPayment({
      paymentId,
    });

    await this.eventStore.appendToStream(
      streamName,
      placedOrder.getUncommittedChanges(),
    );
  }
}
