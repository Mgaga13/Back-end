import { BrannerEntity } from 'src/branners/entities/branner.entity';
import { BaseEntity } from 'src/commom/entities/base.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('banner_detail')
export class BannerDetailEntity extends BaseEntity {
  @ManyToOne(() => ProductEntity, (product) => product.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  @ManyToOne(() => BrannerEntity, (banner) => banner.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'banner_id' })
  banner: BrannerEntity;
}
