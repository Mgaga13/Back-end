import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode, VerifyIpnCall, VnpLocale } from 'vnpay';
import axios from 'axios';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsService } from 'src/products/products.service';
const qs = require('qs');
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const moment = require('moment');
@Injectable()
export class PaymentService {
  constructor(
    private readonly orderService: OrdersService,
    private readonly productService: ProductsService,
  ) {}

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
    // Kiểm tra số lượng sản phẩm
    console.log(cartItem);
    for (const item of cartItem) {
      const cart_items = await this.orderService.findOneCartItem(item);
      if (cart_items.quantity > cart_items.product.quantity) {
        throw new HttpException(
          'Lỗi không đủ sản phẩm để mua hàng',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const items = [];
    const transID = Math.floor(Math.random() * 1000000);
    const app_trans_id = `${moment().format('YYMMDD')}_${transID}`;
    const { total, selectedCartItems } =
      await this.orderService.calculateOrderTotal(cartItem, userId);
    const embed_data = {
      redirecturl: `http://localhost:3337/api/v1/payment/check-order`,
    };
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

  async createCODPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    const { cartItem } = createPaymentDto;

    // Kiểm tra số lượng sản phẩm
    for (const item of cartItem) {
      const cart_items = await this.orderService.findOneCartItem(item);
      if (cart_items.quantity > cart_items.product.quantity) {
        throw new HttpException(
          'Không đủ sản phẩm để mua hàng',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Tính tổng tiền và chuẩn bị dữ liệu
    const { total, selectedCartItems } =
      await this.orderService.calculateOrderTotal(cartItem, userId);

    // Lưu thông tin đơn hàng với trạng thái 'Chờ thanh toán'
    try {
      const order = await this.orderService.createOrderFromCart(
        total,
        selectedCartItems,
        userId,
        'COD',
        null, // Trạng thái chờ thanh toán
      );

      // Gọi hàm updateCartForCOD để cập nhật giỏ hàng sau khi đơn hàng được tạo thành công
      const cartItemIds = selectedCartItems.map((item) => item.id); // Lấy danh sách cartItemIds
      await this.orderService.updateCartForCOD(userId, cartItemIds);

      return {
        success: true,
        message: 'Đơn hàng đã được tạo thành công',
        order,
      };
    } catch (error) {
      console.error('Error creating COD order:', error.message);
      throw new HttpException(
        'Không thể tạo đơn hàng thanh toán khi nhận hàng',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private readonly momoConfig = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    orderInfo: 'pay with MoMo',
    partnerCode: 'MOMO',
    redirectUrl: 'http://localhost:3337/api/v1/payment/check-order-momo',
    ipnUrl: 'https://0778-14-178-58-205.ngrok-free.app/callback', //chú ý: cần dùng ngrok thì momo mới post đến url này được
    requestType: 'payWithMethod',
    extraData: '',
    orderGroupId: '',
    autoCapture: true,
    lang: 'vi',
  };
  async createMomoPayment(
    userId: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<any> {
    const {
      accessKey,
      secretKey,
      partnerCode,
      redirectUrl,
      ipnUrl,
      requestType,
      extraData,
      autoCapture,
      orderGroupId,
      lang,
    } = this.momoConfig;
    const { cartItem } = createPaymentDto;

    // Kiểm tra số lượng sản phẩm
    for (const item of cartItem) {
      const cart_items = await this.orderService.findOneCartItem(item);
      if (cart_items.quantity > cart_items.product.quantity) {
        throw new HttpException(
          'Lỗi không đủ sản phẩm để mua hàng',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const orderId = `${partnerCode}_${new Date().getTime()}`;
    const requestId = orderId;
    const orderInfo = 'Payment for your order';

    const { total, selectedCartItems } =
      await this.orderService.calculateOrderTotal(cartItem, userId);
    const amount = total;
    var rawSignature =
      'accessKey=' +
      accessKey +
      '&amount=' +
      amount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      ipnUrl +
      '&orderId=' +
      orderId +
      '&orderInfo=' +
      orderInfo +
      '&partnerCode=' +
      partnerCode +
      '&redirectUrl=' +
      redirectUrl +
      '&requestId=' +
      requestId +
      '&requestType=' +
      requestType;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });

    try {
      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      // Xử lý logic lưu đơn hàng nếu cần thiết
      if (response.data.resultCode === 0) {
        await this.orderService.createOrderFromCart(
          total,
          selectedCartItems,
          userId,
          'MoMo',
          orderId,
        );
      }

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'MoMo Payment creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async handleMomoCallback(body: any): Promise<any> {
    const { signature, ...data } = body;
    const rawSignature = `partnerCode=${data.partnerCode}&orderId=${data.orderId}&requestId=${data.requestId}&amount=${data.amount}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&transId=${data.transId}&resultCode=${data.resultCode}&message=${data.message}&payType=${data.payType}&responseTime=${data.responseTime}&extraData=${data.extraData}`;
    const expectedSignature = CryptoJS.HmacSHA256(
      rawSignature,
      this.momoConfig.secretKey,
    ).toString();

    if (signature !== expectedSignature) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    if (data.resultCode === 0) {
      // Update order status to paid
      return { success: true, message: 'Payment successful' };
    } else {
      return { success: false, message: 'Payment failed' };
    }
  }

  async checkMomoTransactionStatus(orderId: string): Promise<any> {
    const { accessKey, partnerCode, secretKey } = this.momoConfig;
    const requestId = orderId;

    const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode: 'MOMO',
      requestId: orderId,
      orderId: orderId,
      signature: signature,
      lang: 'vi',
    });

    try {
      const response = await axios.post(
        'https://test-payment.momo.vn/v2/gateway/api/query',
        requestBody,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to check transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
