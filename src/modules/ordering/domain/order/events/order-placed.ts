import type { OrderItem } from '../order-item.ts';
import type { DomainEvent } from '../../events/domain-event.ts';

export interface OrderPlacedEvent extends DomainEvent {
  type: 'OrderPlaced';
  data: OrderPlacedData;
}

interface OrderPlacedData {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  placedAt: string;
}
