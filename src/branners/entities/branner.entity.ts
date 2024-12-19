import { BaseEntity } from 'src/commom/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('banner')
export class BrannerEntity extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'text', nullable: true })
  content: string;
}
