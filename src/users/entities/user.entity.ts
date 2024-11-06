import { BaseEntity } from 'src/commom/entities/base.entity';
import { UserRole } from 'src/commom/utils/constants';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column('varchar', { nullable: false, unique: true })
  email: string;

  @Column('varchar', { nullable: false })
  password: string;

  @Column('varchar', { nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column('varchar', { nullable: true })
  avatar: string;

  @Column('varchar', { nullable: true })
  phone: string;

  @Column({ nullable: true, default: null })
  refreshToken: string;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];
}
