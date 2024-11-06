import { Module } from '@nestjs/common';
import { BrannersService } from './branners.service';
import { BrannersController } from './branners.controller';

@Module({
  controllers: [BrannersController],
  providers: [BrannersService],
})
export class BrannersModule {}
