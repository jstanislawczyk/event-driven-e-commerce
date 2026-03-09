import type { DomainEvent } from '../../events/domain-event.ts';
import { OrderEventType } from './order-event-type.ts';

export interface PaymentAuthorizedEvent extends DomainEvent {
  type: OrderEventType.PAYMENT_AUTHORIZED;
  data: PaymentAuthorizedData;
}

export interface PaymentAuthorizedData {
  orderId: string;
  paymentId: string;
  authorizedAt: string;
}
