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
import { OrderEventType } from '../../domain/order/events/order-event-type.ts';
import type { PaymentRejectedData } from '../../domain/order/events/payment-rejected.ts';
import type { OrderShippedData } from '../../domain/order/events/order-shipped.ts';
import type { OrderDeliveredData } from '../../domain/order/events/order-delivered.ts';

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
    const eventActionMap: Record<OrderEventType, () => Promise<void>> = {
      [OrderEventType.ORDER_PLACED]: () => this.onOrderPlaced(eventData),
      [OrderEventType.PAYMENT_AUTHORIZED]: () =>
        this.onPaymentAuthorized(eventData),
      [OrderEventType.PAYMENT_REJECTED]: () =>
        this.onPaymentRejected(eventData),
      [OrderEventType.ORDER_SHIPPED]: () => this.onOrderShipped(eventData),
      [OrderEventType.ORDER_DELIVERED]: () => this.onOrderDelivered(eventData),
    };

    const eventAction = eventActionMap[event.type as OrderEventType];

    if (!eventAction) {
      console.warn('No handler for event type', event.type);
      return;
    }

    await eventAction();
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

    await this.orderReadRepository.setPaymentAsAuthorized(
      event.orderId,
      new Date(event.authorizedAt),
    );
  }

  private async onPaymentRejected(event: PaymentRejectedData): Promise<void> {
    console.warn(`Payment rejected for order. Id=${event.orderId}`);

    await this.orderReadRepository.setAsPaymentAsRejected(event.orderId);
  }

  private async onOrderShipped(event: OrderShippedData): Promise<void> {
    console.log(`Order shipped. Id=${event.orderId}`);

    await this.orderReadRepository.setAsShipped(
      event.orderId,
      new Date(event.shippedAt),
    );
  }

  private async onOrderDelivered(event: OrderDeliveredData): Promise<void> {
    console.log(`Order delivered. Id=${event.orderId}`);

    await this.orderReadRepository.setAsDelivered(
      event.orderId,
      new Date(event.deliveredAt),
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
