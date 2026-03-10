import type { DomainEvent } from '../../events/domain-event.ts';
import { OrderEventType } from './order-event-type.ts';

export interface OrderShippedEvent extends DomainEvent {
  type: OrderEventType.ORDER_SHIPPED;
  data: OrderShippedData;
}

export interface OrderShippedData {
  orderId: string;
  shippedAt: string;
}
