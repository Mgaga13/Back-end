import { BaseEntity } from 'src/commom/entities/base.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.orders, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  status: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column()
  total: number;
}
