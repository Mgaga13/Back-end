import { BaseEntity } from 'src/commom/entities/base.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { Check, Column, Entity, ManyToOne } from 'typeorm';

@Check(`"star" >= 1 AND "star" <= 5`)
@Entity('feedbacks')
export class FeedbackEntity extends BaseEntity {
  @ManyToOne(() => ProductEntity, (product) => product.id, {
    onDelete: 'CASCADE',
  })
  product: ProductEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: UserEntity;
  @Column({ default: 0, type: 'int' })
  // { type: 'number', check: 'star >= 1 AND star <= 5' }
  star: number;

  @Column({ type: 'text', nullable: true })
  content: string;
}
