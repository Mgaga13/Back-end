import { BaseEntity } from 'src/commom/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('brands')
export class BrandEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  image: string;
}
