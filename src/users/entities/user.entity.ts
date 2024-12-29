import { CartEntity } from 'src/carts/entities/cart.entity';
import { BaseEntity } from 'src/commom/entities/base.entity';
import { UserRole } from 'src/commom/utils/constants';
import { FeedbackEntity } from 'src/feedback/entities/feedback.entity';
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
  gender: string; // Giới tính: 'Male', 'Female', hoặc bất kỳ định dạng nào bạn muốn

  @Column('date', { nullable: true })
  dob: Date; // Ngày sinh

  @Column('varchar', { nullable: true })
  avatar: string;

  @Column('varchar', { nullable: true })
  phone: string;

  @Column('varchar', { nullable: true })
  address: string;

  @Column({ nullable: true, default: null })
  refreshToken: string;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @OneToMany(() => CartEntity, (cart) => cart.user, { cascade: true })
  carts: CartEntity[];

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  tokenCreatedAt: Date;

  @OneToMany(() => FeedbackEntity, (feedback) => feedback.user, {
    cascade: true,
  })
  feedbacks: FeedbackEntity[];
}
