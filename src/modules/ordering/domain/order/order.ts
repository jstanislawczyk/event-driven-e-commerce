import { OrderStatus } from './order-status.ts';
import { OrderItem } from './order-item.ts';
import type { OrderPlacedEvent } from './events/order-placed.ts';
import type { DomainEvent } from '../events/domain-event.ts';
import type { PaymentAuthorizedEvent } from './events/payment-authorized.ts';

export class Order {
  private constructor(
    private id: string = '',
    private customerId: string = '',
    private paymentId: string | null = null,
    private status: OrderStatus = OrderStatus.NONE,
    private totalAmount: number = 0,
    private items: OrderItem[] = [],
    private placedAt: Date | null = null,
    private paidAt: Date | null = null,
    private changes: DomainEvent[] = [],
  ) {}

  public static rehydrate(events: DomainEvent[]) {
    const order = new Order();

    for (const event of events) {
      order.apply(event);
    }

    return order;
  }

  public static createNew(orderId: string, customerId: string): Order {
    const order = new Order();
    order.id = orderId;
    order.customerId = customerId;

    return order;
  }

  public placeOrder(input: {
    orderId: string;
    customerId: string;
    items: OrderItem[];
  }): Order {
    if (this.status !== OrderStatus.NONE) {
      throw new Error('Order has already been placed');
    }

    this.status = OrderStatus.AWAITING_PAYMENT;

    const { orderId, customerId, items } = input;
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const event: OrderPlacedEvent = {
      type: 'OrderPlaced',
      data: {
        orderId,
        customerId,
        items,
        totalAmount,
        placedAt: new Date().toISOString(),
      },
    };

    this.apply(event);

    return this;
  }

  public authorizePayment(input: {
    paymentId: string;
    authorizedAt: Date;
  }): Order {
    if (this.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new Error(
        'Payment can only be authorized for orders awaiting payment',
      );
    }

    if (!this.id) {
      throw new Error('Order ID is missing');
    }

    const { paymentId, authorizedAt } = input;
    const event: PaymentAuthorizedEvent = {
      type: 'PaymentAuthorized',
      data: {
        orderId: this.id,
        paymentId,
        authorizedAt: authorizedAt.toISOString(),
      },
    };

    this.apply(event);

    return this;
  }

  public getUncommittedChanges() {
    return this.changes;
  }

  private apply(event: any) {
    switch (event.type) {
      case 'OrderPlaced':
        this.applyOrderPlaced(event as OrderPlacedEvent);
        break;
      case 'PaymentAuthorized':
        this.applyPaymentAuthorized(event as PaymentAuthorizedEvent);
        break;
      default:
        throw new Error(`Unknown Order event type: ${event.type}`);
    }

    this.changes.push(event);
  }

  private applyOrderPlaced(event: OrderPlacedEvent) {
    const { orderId, customerId, items, placedAt, totalAmount } = event.data;

    this.id = orderId;
    this.customerId = customerId;
    this.items = items;
    this.totalAmount = totalAmount;
    this.placedAt = new Date(placedAt);
  }

  private applyPaymentAuthorized(event: PaymentAuthorizedEvent) {
    const { paymentId, authorizedAt } = event.data;
    this.paymentId = paymentId;
    this.status = OrderStatus.PAYMENT_AUTHORIZED;
    this.paidAt = new Date(authorizedAt);
  }
}
