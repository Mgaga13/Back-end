import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Roles } from 'src/auth/decorators/roler.decorator';
import { UserRole } from 'src/commom/utils/constants';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
@UseGuards(JwtAuthGuard)
@Controller('v1/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post('create')
  async createPayment(@Req() req, @Body() createPaymentDto: CreatePaymentDto) {
    try {
      const user = req['user'];
      const result = await this.paymentService.createPayment(
        user.id,
        createPaymentDto,
      ); // Pass the whole DTO
      return result;
    } catch (error) {
      throw new Error(error.message || 'Payment creation failed');
    }
  }
  @Post('/callback')
  async CheckPayment(@Body() body: any) {
    try {
      const result = await this.paymentService.checkcallBack(body);
      return result;
    } catch (error) {
      throw new Error(error.message || 'Payment creation failed');
    }
  }
  @Public()
  @Get('/check-order')
  async CheckOrder(@Query() query: any, @Res() res: Response) {
    const { apptransid } = query;
    const data = await this.paymentService.checkOrderStatus(apptransid);
    if (data.success === true) {
      res.redirect('http://localhost:5173/payment/payment-success');
    } else {
      res.redirect('http://localhost:5173/payment/payment-failed');
    }
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post('create-cod')
  async createCODPayment(
    @Req() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    try {
      const user = req['user'];
      const result = await this.paymentService.createCODPayment(
        user.id,
        createPaymentDto,
      );
      return result;
    } catch (error) {
      throw new Error(error.message || 'Không thể xử lý thanh toán COD');
    }
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post('create-momo')
  async createMoMoPayment(
    @Req() req,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    try {
      const user = req['user'];
      const result = await this.paymentService.createMomoPayment(
        user.id,
        createPaymentDto,
      );
      return result;
    } catch (error) {
      throw new Error(error.message || 'Không thể xử lý thanh toán COD');
    }
  }

  @Public()
  @Get('/check-order-momo')
  async checkMomoTransactionStatus(
    @Res() res: Response,
    @Query('orderId') orderId: string,
  ) {
    console.log('orderId', orderId);
    const data = await this.paymentService.checkMomoTransactionStatus(orderId);
    // if (data.success === true) {
    //   res.redirect('http://localhost:5173/payment/payment-success');
    // } else {
    //   res.redirect('http://localhost:5173/payment/payment-failed');
    // }
  }
}
