import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode, VerifyIpnCall, VnpLocale } from 'vnpay';

@Injectable()
export class PaymentService {
  constructor(private readonly vnpayService: VnpayService) {}
  create(ipAddress: string, createPaymentDto: CreatePaymentDto) {
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: Number(createPaymentDto.price),
      vnp_IpAddr: ipAddress,
      vnp_TxnRef: createPaymentDto.order_id,
      vnp_OrderInfo: createPaymentDto.order_id,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: 'http://localhost:3337/api/v1/payment/success', // Đường dẫn nên là của frontend
      vnp_Locale: VnpLocale.VN,
    });
    return paymentUrl;
  }
  async getBankList() {
    return this.vnpayService.getBankList();
  }

  async verify(query: any) {
    const verify = this.vnpayService.verifyIpnCall(query);
    return verify;
  }
}
