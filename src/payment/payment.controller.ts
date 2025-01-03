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
      console.log(body);
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
  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post('create_payment_url')
  async createPaymentUrl(
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const user = req['user'];
    const paymentUrl = await this.paymentService.createPaymentUrl(
      user.id,
      createPaymentDto,
    );
    res.json({ paymentUrl });
  }

  @Public()
  @Get('vnpay-check-order')
  async logVnpayData(
    @Query()
    body: {
      vnp_PayDate: string;
      vnp_TransactionStatus: string;
      vnp_TxnRef: string;
      vnp_ResponseCode: string;
    },
    @Res() res: Response,
  ) {
    const data: any = await this.paymentService.handlePaymentReturn(body);
    if (data.success === true) {
      res.redirect('http://localhost:5173/payment/payment-success');
    } else {
      res.redirect('http://localhost:5173/payment/payment-failed');
    }
  }

  // @Post('refund')
  // async refund(@Body() body: { orderId: string; transDate: string; amount: number; transType: string; user: string }) {
  //   const { orderId, transDate, amount, transType, user } = body;
  //   return this.paymentService.refundTransaction({ orderId, transDate, amount, transType, user });
  // }
}
