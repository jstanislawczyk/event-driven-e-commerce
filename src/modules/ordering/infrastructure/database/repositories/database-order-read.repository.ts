import type { Repository } from 'typeorm';
import type { OrderReadRepository } from '../../../domain/repositories/order-read.repository.ts';
import { OrderReadEntity } from '../entities/read-model/order-read.entity.ts';
import type { OrderPlacedData } from '../../../domain/order/events/order-placed.ts';
import { dataSource } from '../../../../../database/data-source.ts';

export class DatabaseOrderReadRepository implements OrderReadRepository<OrderReadEntity> {
  private readonly orderReadRepository: Repository<OrderReadEntity>;

  constructor() {
    this.orderReadRepository = dataSource.getRepository(OrderReadEntity);
  }

  async insert(data: OrderPlacedData): Promise<OrderReadEntity> {
    const { orderId, customerId, totalAmount, placedAt, items } = data;
    const entityToInsert = this.orderReadRepository.create({
      orderId,
      customerId,
      customerEmail: '',
      totalAmount,
      placedAt,
      status: 'AWAITING_PAYMENT',
    });

    return this.orderReadRepository.save(entityToInsert);
  }
}
