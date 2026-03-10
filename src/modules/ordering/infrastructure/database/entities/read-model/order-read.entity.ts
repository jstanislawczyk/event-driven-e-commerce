import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('orders_read')
export class OrderReadEntity {
  @PrimaryColumn()
  orderId: string;

  @Index()
  @Column()
  customerId: string;

  @Column()
  customerEmail: string;

  @Index()
  @Column()
  status:
    | 'AWAITING_PAYMENT'
    | 'PAYMENT_AUTHORIZED'
    | 'PAYMENT_REJECTED'
    | 'SHIPPED';

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column()
  placedAt: Date;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  shippedAt?: Date;
}
