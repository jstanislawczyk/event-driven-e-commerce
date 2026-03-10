import type { Repository } from 'typeorm';
import { OrderReadEntity } from '../entities/read-model/order-read.entity.ts';
import type { OrderPlacedData } from '../../../domain/order/events/order-placed.ts';
import { dataSource } from '../../../../../database/data-source.ts';
import type { Customer } from '../../../application/ports/customer-reader.ts';

export interface OrderReadRepository {
  insert(event: OrderPlacedData, customer: Customer): Promise<OrderReadEntity>;
  setPaymentAsAuthorized(orderId: string, paidAt: Date): Promise<void>;
  setAsPaymentAsRejected(orderId: string): Promise<void>;
}

export class DatabaseOrderReadRepository implements OrderReadRepository {
  private readonly orderReadRepository: Repository<OrderReadEntity>;

  constructor() {
    this.orderReadRepository = dataSource.getRepository(OrderReadEntity);
  }

  async insert(
    data: OrderPlacedData,
    customer: Customer,
  ): Promise<OrderReadEntity> {
    const { orderId, customerId, totalAmount, placedAt } = data;
    const entityToInsert = this.orderReadRepository.create({
      orderId,
      customerId,
      customerEmail: customer.email,
      totalAmount,
      placedAt,
      status: 'AWAITING_PAYMENT',
    });

    return this.orderReadRepository.save(entityToInsert);
  }

  async setPaymentAsAuthorized(orderId: string, paidAt: Date): Promise<void> {
    await this.orderReadRepository.update(
      { orderId },
      { status: 'PAYMENT_AUTHORIZED', paidAt },
    );
  }

  async setAsPaymentAsRejected(orderId: string): Promise<void> {
    await this.orderReadRepository.update(
      { orderId },
      { status: 'PAYMENT_REJECTED' },
    );
  }
}
