import type { DomainEvent } from '../../events/domain-event.ts';

export interface PaymentAuthorizedEvent extends DomainEvent {
  type: 'PaymentAuthorized';
  data: PaymentAuthorizedData;
}

export interface PaymentAuthorizedData {
  orderId: string;
  paymentId: string;
  authorizedAt: string;
}
