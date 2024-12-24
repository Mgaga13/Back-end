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

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  total: number;

  @OneToMany(() => OrderDetailEntity, (orderDetail) => orderDetail.order, {
    cascade: true,
  })
  orderDetails: OrderDetailEntity[];

  @Column({ default: false })
  paymentStatus: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentReference: string;
}
