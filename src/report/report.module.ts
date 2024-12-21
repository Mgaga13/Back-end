import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { OrderDetailEntity } from 'src/order-details/entities/order-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
