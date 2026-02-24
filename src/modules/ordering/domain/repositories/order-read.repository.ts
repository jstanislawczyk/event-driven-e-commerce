import type { OrderPlacedData } from '../order/events/order-placed.ts';

export interface OrderReadRepository<T> {
  insert(event: OrderPlacedData): Promise<T>;
}
