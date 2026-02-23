import type { OrderPlacedData } from '../../domain/order/events/order-placed.ts';
import type { AllStreamResolvedEvent } from '@kurrent/kurrentdb-client';
import type { EventStoreSubscriber } from '../database/subscribers/event-store.subscriber.ts';

export class OrdersProjection {
  constructor(private readonly eventStoreSubscriber: EventStoreSubscriber) {}

  async start() {
    const orderStreamPrefix = 'order-';
    const subscription =
      await this.eventStoreSubscriber.subscribeToStream(orderStreamPrefix);

    for await (const resolvedEvent of subscription) {
      if (!resolvedEvent.event) {
        continue;
      }

      await this.handle(resolvedEvent);
    }
  }

  private async handle(resolvedEvent: AllStreamResolvedEvent) {
    const event = resolvedEvent.event!;
    const data = event.data as any;

    switch (event.type) {
      case 'OrderPlaced':
        await this.onOrderPlaced(data);
        break;
    }
  }

  private async onOrderPlaced(data: OrderPlacedData) {
    const { orderId, customerId, items } = data;

    console.log('OrderPlaced received', orderId, customerId, items);
  }
}
