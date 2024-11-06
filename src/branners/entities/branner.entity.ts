import { BaseEntity } from 'src/commom/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('banner')
export class BrannerEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column()
  status: number;
}
