import { OrderStatus } from './order-status.ts';
import { OrderItem } from './order-item.ts';
import type { OrderPlacedEvent } from './events/order-placed.ts';
import type { DomainEvent } from '../events/domain-event.ts';
import type { PaymentAuthorizedEvent } from './events/payment-authorized.ts';
import { OrderEventType } from './events/order-event-type.ts';
import type { PaymentRejectedEvent } from './events/payment-rejected.ts';
import type { OrderShippedEvent } from './events/order-shipped.ts';
import type { OrderDeliveredEvent } from './events/order-delivered.ts';

export class Order {
  private constructor(
    private id: string = '',
    private customerId: string = '',
    private paymentId: string | null = null,
    private status: OrderStatus = OrderStatus.NONE,
    private items: OrderItem[] = [],
    private placedAt: Date | null = null,
    private paidAt: Date | null = null,
    private changes: DomainEvent[] = [],
  ) {}

  public static rehydrate(events: DomainEvent[]): Order {
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

    const { orderId, customerId, items } = input;
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const event: OrderPlacedEvent = {
      type: OrderEventType.ORDER_PLACED,
      data: {
        orderId,
        customerId,
        items,
        totalAmount,
        placedAt: new Date().toISOString(),
      },
    };

    this.raise(event);

    return this;
  }

  public authorizePayment(input: {
    paymentId: string;
    authorizedAt: Date;
  }): Order {
    if (
      this.status !== OrderStatus.AWAITING_PAYMENT &&
      this.status !== OrderStatus.PAYMENT_REJECTED
    ) {
      throw new Error(
        'Payment can only be authorized for orders awaiting payment or previously rejected',
      );
    }

    if (!this.id) {
      throw new Error('Order ID is missing');
    }

    const { paymentId, authorizedAt } = input;
    const event: PaymentAuthorizedEvent = {
      type: OrderEventType.PAYMENT_AUTHORIZED,
      data: {
        orderId: this.id,
        paymentId,
        authorizedAt: authorizedAt.toISOString(),
      },
    };

    this.raise(event);

    return this;
  }

  public rejectPayment(input: { paymentId: string }): Order {
    if (this.status !== OrderStatus.AWAITING_PAYMENT) {
      throw new Error(
        'Payment can only be rejected for orders awaiting payment',
      );
    }

    if (!this.id) {
      throw new Error('Order ID is missing');
    }

    const event: PaymentRejectedEvent = {
      type: OrderEventType.PAYMENT_REJECTED,
      data: {
        orderId: this.id,
        paymentId: input.paymentId,
      },
    };

    this.raise(event);

    return this;
  }

  public ship(input: { shippedAt: Date }): Order {
    if (this.status !== OrderStatus.PAYMENT_AUTHORIZED) {
      throw new Error('Only orders with authorized payment can be shipped');
    }

    if (!this.id) {
      throw new Error('Order ID is missing');
    }

    const event: OrderShippedEvent = {
      type: OrderEventType.ORDER_SHIPPED,
      data: {
        orderId: this.id,
        shippedAt: input.shippedAt.toISOString(),
      },
    };

    this.raise(event);

    return this;
  }

  public deliver(input: { deliveredAt: Date }): Order {
    if (this.status !== OrderStatus.SHIPPED) {
      throw new Error('Only shipped orders can be delivered');
    }

    if (!this.id) {
      throw new Error('Order ID is missing');
    }

    const event: OrderDeliveredEvent = {
      type: OrderEventType.ORDER_DELIVERED,
      data: {
        orderId: this.id,
        deliveredAt: input.deliveredAt.toISOString(),
      },
    };

    this.raise(event);

    return this;
  }

  public getUncommittedChanges(): DomainEvent[] {
    return this.changes;
  }

  private raise(event: any): void {
    this.apply(event);
    this.changes.push(event);
  }

  private apply(event: any): void {
    switch (event.type) {
      case OrderEventType.ORDER_PLACED:
        this.applyOrderPlaced(event as OrderPlacedEvent);
        break;
      case OrderEventType.PAYMENT_AUTHORIZED:
        this.applyPaymentAuthorized(event as PaymentAuthorizedEvent);
        break;
      case OrderEventType.PAYMENT_REJECTED:
        this.applyPaymentRejected(event as PaymentRejectedEvent);
        break;
      case OrderEventType.ORDER_SHIPPED:
        this.applyOrderShipped();
        break;
      case OrderEventType.ORDER_DELIVERED:
        this.applyOrderDelivered();
        break;
      default:
        throw new Error(`Unknown Order event type: ${event.type}`);
    }
  }

  private applyOrderPlaced(event: OrderPlacedEvent): void {
    const { orderId, customerId, items, placedAt } = event.data;

    this.id = orderId;
    this.customerId = customerId;
    this.status = OrderStatus.AWAITING_PAYMENT;
    this.items = items;
    this.placedAt = new Date(placedAt);
  }

  private applyPaymentAuthorized(event: PaymentAuthorizedEvent): void {
    const { paymentId, authorizedAt } = event.data;
    this.paymentId = paymentId;
    this.status = OrderStatus.PAYMENT_AUTHORIZED;
    this.paidAt = new Date(authorizedAt);
  }

  private applyPaymentRejected(event: PaymentRejectedEvent): void {
    this.paymentId = event.data.paymentId;
    this.status = OrderStatus.PAYMENT_REJECTED;
  }

  private applyOrderShipped(): void {
    this.status = OrderStatus.SHIPPED;
  }

  private applyOrderDelivered(): void {
    this.status = OrderStatus.DELIVERED;
  }
}
