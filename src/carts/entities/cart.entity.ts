import { CartItemEntity } from 'src/cart_items/entities/cart_item.entity';
import { BaseEntity } from 'src/commom/entities/base.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('carts')
export class CartEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  user: UserEntity;

  @OneToMany(() => CartItemEntity, (cartItem) => cartItem.cart, {
    cascade: true,
  })
  cartItems: CartItemEntity[];
}
