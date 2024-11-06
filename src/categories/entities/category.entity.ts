import { BaseEntity } from 'src/commom/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('categories')
export class CategoryEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;
}
