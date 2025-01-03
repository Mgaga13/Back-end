// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const moment = require('moment');
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string, id: string) {
    const resetLink = `${this.configService.get<string>(
      'URL_CHANGE_PASSWORD',
    )}?token=${token}`;
    const mailOptions = {
      from: 'noreply@shop.site', // Email sender
      to: to, // Recipient's email address
      subject: 'Đổi mật khẩu', // Email subject
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px;">
          <p>Bạn đã yêu cầu đặt lại mật khẩu của mình. Vui lòng nhấp vào liên kết bên dưới để tiếp tục:</p>
          <p>
            <a href="${resetLink}" style="color: #5EBBFF; text-decoration: none;">Đổi mật khẩu</a>
          </p>
          <p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  /**
   *
   * @param order_id
   * @param order_date
   * @param user_name
   * @param to
   */
  async sendOrderCompelete(
    order_id: string,
    order_date: any,
    user_name: string,
    to: string,
  ) {
    let now = new Date();
    const dateString = moment(now).format('YYYY-MM-DD');
    const mailOptions = {
      from: 'noreply@appreviews.site', // Email sender
      to: to, // Recipient's email address
      subject: 'Order Completed', // Email subject
      html: `
        <div>
          <p>Order Completion Notification ${order_id}</p>

          <p>Dear ${user_name}</p>

          <p>We are pleased to inform you that your order with ID ${order_id} has been successfully completed.</p>

          <p>Order Information:</p>

          <ul>
          <li>Order ID: ${order_id}</li>
          <li>Order Date: ${order_date}</li>
          <li>Completion Date: ${dateString}</li>
          </ul>
          <p>If you have any questions or need further assistance, feel free to contact us via this email or telegram :  <a href="https://t.me/aso_tool">aso_tool</a> 
          </p>
          <p>Thank you very much for trusting and choosing our services.</p>

          Best regards,
          </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
