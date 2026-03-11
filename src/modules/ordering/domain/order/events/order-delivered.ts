import type { DomainEvent } from '../../events/domain-event.ts';
import { OrderEventType } from './order-event-type.ts';

export interface OrderDeliveredEvent extends DomainEvent {
  type: OrderEventType.ORDER_DELIVERED;
  data: OrderDeliveredData;
}

export interface OrderDeliveredData {
  orderId: string;
  deliveredAt: string;
}
