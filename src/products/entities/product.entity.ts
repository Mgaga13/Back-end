import { BrandEntity } from 'src/brands/entities/brand.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { BaseEntity } from 'src/commom/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ default: 0 })
  oldprice: number;

  @Column({ type: 'simple-array' })
  image: string[];

  @Column()
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  specification: Record<string, any>;

  @Column({ default: 0 })
  buyturn: number; // Sản phẩm nào mua nhiều

  @Column()
  quantity: number;

  @ManyToOne(() => BrandEntity, (brand) => brand.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;
}
