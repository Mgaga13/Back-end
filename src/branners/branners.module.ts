import { Module } from '@nestjs/common';
import { BrannersService } from './branners.service';
import { BrannersController } from './branners.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [BrannersController],
  providers: [BrannersService],
  exports: [BrannersModule],
})
export class BrannersModule {}
