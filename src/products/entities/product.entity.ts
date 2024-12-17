import { BrandEntity } from 'src/brands/entities/brand.entity';
import { CategoryEntity } from 'src/categories/entities/category.entity';
import { BaseEntity } from 'src/commom/entities/base.entity';
import { TypeEntity } from 'src/type-product/entities/type-product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  oldprice: number;

  @Column({ type: 'simple-array' })
  image: string[];

  @Column()
  description: string;

  @Column()
  specification: string;

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

  @ManyToOne(() => TypeEntity, (type) => type.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'type_id' })
  typesProduct: TypeEntity;
}
