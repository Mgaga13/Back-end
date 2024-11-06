import { BaseEntity } from 'src/commom/entities/base.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity } from 'typeorm';

@Entity('carts')
export class CartEntity extends BaseEntity {
  @Column()
  session_id: string;

  user: UserEntity;
}
