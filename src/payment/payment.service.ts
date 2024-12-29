import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode, VerifyIpnCall, VnpLocale } from 'vnpay';
import axios from 'axios';
import { OrdersService } from 'src/orders/orders.service';
const qs = require('qs');
const CryptoJS = require('crypto-js');
const moment = require('moment');
@Injectable()
export class PaymentService {
  constructor(private readonly orderService: OrdersService) {}

  private readonly config = {
    app_id: '2553',
    key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
    key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
    endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
  };
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  }
  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const { amount, cartItem } = createPaymentDto;

    const items = [];
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;
    const { total, selectedCartItems } =
      await this.orderService.calculateOrderTotal(cartItem, userId);
    const embed_data = {
      redirecturl: `http://localhost:3337/api/v1/payment/check-order`,
    };
    console.log('total', total);
    const order = {
      app_id: this.config.app_id,
      app_trans_id: app_trans_id,
      app_user: userId,
      app_time: Date.now(),
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: total,
      callback_url: 'http://localhost:3337/api/v1/payment/callback',
      description: `Payment for the order #${transID}`,
      bank_code: '',
    };

    const data =
      `${this.config.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|` +
      `${order.app_time}|${order.embed_data}|${order.item}`;
    order['mac'] = CryptoJS.HmacSHA256(data, this.config.key1).toString();
    try {
      const result = await axios.post(this.config.endpoint, null, {
        params: order,
      });
      if (result?.data?.return_code === 1) {
        await this.orderService.createOrderFromCart(
          total,
          selectedCartItems,
          userId,
          'Zalo Pay',
          app_trans_id,
        );
      }
      return result.data;
    } catch (error) {
      throw new Error(error.response?.data || 'Payment creation failed');
    }
  }

  checkcallBack(body: any) {
    let mac = CryptoJS.HmacSHA256(body.dataStr, this.config.key2).toString();
    console.log(mac);
    console.log(body);
    if (body.reqMac !== mac) {
      // callback không hợp lệ
      throw new HttpException(
        {
          code: -1,
          message: 'mac not equal',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return {
        code: 1,
        message: 'success',
      };
    }
  }

  async checkOrderStatus(app_trans_id: string): Promise<any> {
    const postData = {
      app_id: this.config.app_id,
      app_trans_id,
    };

    const data = `${postData.app_id}|${postData.app_trans_id}|${this.config.key1}`;
    postData['mac'] = CryptoJS.HmacSHA256(data, this.config.key1).toString();

    const postConfig = {
      method: 'post',
      url: 'https://sb-openapi.zalopay.vn/v2/query',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: qs.stringify(postData),
    };

    try {
      const response = await axios(postConfig);
      if (response.data.return_code === 1) {
        const order = await this.orderService.checkOrder(app_trans_id);
        if (order.affected == 1) {
          return {
            success: true,
            message: 'Thanh toán thành công',
          };
        } else {
          return {
            success: false,
            message: 'Thanh toán thất bại',
          };
        }
      }
    } catch (error) {
      console.error('Error querying order status:', error.message);
      throw new HttpException(
        'Failed to query order status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
