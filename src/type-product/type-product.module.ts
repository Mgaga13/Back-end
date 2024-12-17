import { Module } from '@nestjs/common';
import { TypeProductService } from './type-product.service';
import { TypeProductController } from './type-product.controller';

@Module({
  controllers: [TypeProductController],
  providers: [TypeProductService],
})
export class TypeProductModule {}
