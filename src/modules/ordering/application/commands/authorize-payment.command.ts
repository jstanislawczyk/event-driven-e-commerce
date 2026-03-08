export interface AuthorizePaymentCommand {
  orderId: string;
  paymentId: string;
  authorizedAt: Date;
}
