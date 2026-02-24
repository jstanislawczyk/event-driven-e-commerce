import type { OrderPlacedData } from '../../domain/order/events/order-placed.ts';
import type { AllStreamResolvedEvent } from '@kurrent/kurrentdb-client';
import type { EventStoreSubscriber } from '../database/subscribers/event-store.subscriber.ts';
import type { OrderReadRepository } from '../../domain/repositories/order-read.repository.ts';
import type { OrderReadEntity } from '../database/entities/read-model/order-read.entity.ts';

export class OrdersSubscriber {
  constructor(
    private readonly eventStoreSubscriber: EventStoreSubscriber,
    private readonly orderReadRepository: OrderReadRepository<OrderReadEntity>,
  ) {}

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

  private async handle(resolvedEvent: AllStreamResolvedEvent): Promise<void> {
    const event = resolvedEvent.event;

    if (!event) {
      console.warn('Unknown order event', event);
      return;
    }

    const eventData = event.data as any;

    switch (event.type) {
      case 'OrderPlaced':
        await this.onOrderPlaced(eventData);
        break;
    }
  }

  private async onOrderPlaced(event: OrderPlacedData): Promise<void> {
    console.log(`Placing new order. Id=${event.orderId}`);
    await this.orderReadRepository.insert(event);
  }
}
