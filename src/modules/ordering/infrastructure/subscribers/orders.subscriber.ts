import type { OrderPlacedData } from '../../domain/order/events/order-placed.ts';
import type {
  AllStreamResolvedEvent,
  AllStreamSubscription,
} from '@kurrent/kurrentdb-client';
import type {
  EventStoreSubscriber,
  StreamCheckpoint,
} from '../database/subscribers/event-store.subscriber.ts';
import type { CustomerReader } from '../../application/ports/customer-reader.ts';
import type { OrderReadRepository } from '../database/repositories/database-order-read.repository.ts';
import type { SubscriptionCheckpointRepository } from '../database/repositories/subscription-checkpoint.repository.ts';
import type { SubscriptionCheckpointEntity } from '../database/entities/subscription-checkpoint.entity.ts';
import type { AllStreamRecordedEvent } from '@kurrent/kurrentdb-client/dist/types/events.d.ts';
import type { PaymentAuthorizedData } from '../../domain/order/events/payment-authorized.ts';

export class OrdersSubscriber {
  constructor(
    private readonly eventStoreSubscriber: EventStoreSubscriber,
    private readonly orderReadRepository: OrderReadRepository,
    private readonly customerReader: CustomerReader,
    private readonly subscriptionCheckpointRepository: SubscriptionCheckpointRepository,
  ) {}

  async start() {
    const subscriptionCheckpoint =
      await this.subscriptionCheckpointRepository.get('orders');
    const subscription = await this.getSubscription(subscriptionCheckpoint);

    for await (const resolvedEvent of subscription) {
      await this.handleSubscriptionEvent(resolvedEvent);
    }
  }

  private async getSubscription(
    subscriptionCheckpoint: SubscriptionCheckpointEntity | null,
  ): Promise<AllStreamSubscription> {
    const orderStreamPrefix = 'order-';
    const checkpoint: StreamCheckpoint | undefined = subscriptionCheckpoint
      ? {
          commit: subscriptionCheckpoint.commit,
          prepare: subscriptionCheckpoint.prepare,
        }
      : undefined;

    return this.eventStoreSubscriber.subscribeToStream(
      orderStreamPrefix,
      checkpoint,
    );
  }

  private async handleSubscriptionEvent(
    resolvedEvent: AllStreamResolvedEvent,
  ): Promise<void> {
    const { event } = resolvedEvent;

    if (!event) {
      console.warn('Unknown order event', event);
      return;
    }

    await this.executeEventAction(event);
    await this.saveCheckpoint(event);
  }

  private async executeEventAction(
    event: AllStreamRecordedEvent,
  ): Promise<void> {
    const eventData = event.data as any;

    switch (event.type) {
      case 'OrderPlaced':
        await this.onOrderPlaced(eventData);
        break;
      case 'PaymentAuthorized':
        await this.onPaymentAuthorized(eventData);
        break;
    }
  }

  private async onOrderPlaced(event: OrderPlacedData): Promise<void> {
    console.log(`Placing new order. Id=${event.orderId}`);
    const customer = await this.customerReader.findById(event.customerId);

    await this.orderReadRepository.insert(event, customer);
  }

  private async onPaymentAuthorized(
    event: PaymentAuthorizedData,
  ): Promise<void> {
    console.log(`Payment authorized for order. Id=${event.orderId}`);

    await this.orderReadRepository.updatePaymentStatus(
      event.orderId,
      new Date(event.authorizedAt),
    );
  }

  private async saveCheckpoint(event: AllStreamRecordedEvent): Promise<void> {
    if (!event.position) {
      console.warn('Event has no position, skipping checkpoint save', event);
      return;
    }

    const { commit, prepare } = event.position;

    await this.subscriptionCheckpointRepository.save({
      streamName: 'orders',
      commit: commit.toString(),
      prepare: prepare.toString(),
    });
  }
}
