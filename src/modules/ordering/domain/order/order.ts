import { OrderStatus } from './order-status.ts';
import { OrderItem } from './order-item.ts';
import type { OrderPlacedEvent } from './events/order-placed.ts';
import type { DomainEvent } from '../events/domain-event.ts';

export class Order {
  constructor(
    private id: string = '',
    private customerId: string = '',
    private status: OrderStatus = OrderStatus.NONE,
    private totalAmount: number = 0,
    private items: OrderItem[] = [],
    private placedAt: Date | null = null,
    private changes: DomainEvent[] = [],
  ) {}

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

  public getUncommittedChanges() {
    return this.changes;
  }

  private apply(event: any) {
    switch (event.type) {
      case 'OrderPlaced':
        this.applyOrderPlaced(event as OrderPlacedEvent);
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
}
