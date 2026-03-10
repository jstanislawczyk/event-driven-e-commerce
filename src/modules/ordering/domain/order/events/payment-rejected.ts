import type { DomainEvent } from '../../events/domain-event.ts';
import { OrderEventType } from './order-event-type.ts';

export interface PaymentRejectedEvent extends DomainEvent {
  type: OrderEventType.PAYMENT_REJECTED;
  data: PaymentRejectedData;
}

export interface PaymentRejectedData {
  orderId: string;
  paymentId: string;
}
