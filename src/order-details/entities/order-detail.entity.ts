import { BaseEntity } from 'src/commom/entities/base.entity';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('order_details')
export class OrderDetailEntity extends BaseEntity {
  @ManyToOne(() => OrderEntity, (order) => order.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, (product) => product.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column()
  price: number;

  @Column()
  quantity: number;
}
