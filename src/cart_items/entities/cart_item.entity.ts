import { CartEntity } from 'src/carts/entities/cart.entity';
import { BaseEntity } from 'src/commom/entities/base.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('cart_items')
export class CartItemEntity extends BaseEntity {
  @ManyToOne(() => CartEntity, (cart) => cart.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity, (product) => product.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @Column()
  quantity: number;
}
