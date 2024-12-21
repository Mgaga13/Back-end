import { BaseEntity } from 'src/commom/entities/base.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderDetailEntity } from 'src/order-details/entities/order-detail.entity';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'smallint', default: 0 })
  status: number; // 0: Pending, 1: Completed, 2: Canceled

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  total: number;

  @OneToMany(() => OrderDetailEntity, (orderDetail) => orderDetail.order, {
    cascade: true,
  })
  orderDetails: OrderDetailEntity[];

  @Column({ default: false })
  paymentStatus: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentMethod: string; // Ví dụ: "ZaloPay", "PayPal", v.v.

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference: string; // Mã giao dịch thanh toán từ hệ thống thanh toán
}
