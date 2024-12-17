import { BaseEntity } from 'src/commom/entities/base.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('type')
export class TypeEntity extends BaseEntity {
  @Column()
  name: string;
}
