import type { OrderItem } from '../order-item.ts';
import type { DomainEvent } from '../../events/domain-event.ts';
import { OrderEventType } from './order-event-type.ts';

export interface OrderPlacedEvent extends DomainEvent {
  type: OrderEventType.ORDER_PLACED;
  data: OrderPlacedData;
}

export interface OrderPlacedData {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  placedAt: string;
}
