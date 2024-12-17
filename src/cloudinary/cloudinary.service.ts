import { Injectable } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import sharp = require('sharp');
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
  async uploadMultipleFiles(
    name: string,
    files: Express.Multer.File[],
  ): Promise<CloudinaryResponse[]> {
    const uploadPromises: Promise<CloudinaryResponse>[] = files.map((file) =>
      this.uploadToCloudinary(name, file),
    );

    return Promise.all(uploadPromises);
  }

  async uploadToCloudinary(
    name: string,
    file: Express.Multer.File,
  ): Promise<CloudinaryResponse> {
    const image = sharp(file.buffer, { failOnError: false });

    // Lấy metadata để tính toán kích thước mới
    const metadata = await image.metadata();
    const width = Math.floor(metadata.width * (90 / 100)); // Resize width giảm 10%
    const height = Math.floor(metadata.height * (90 / 100)); // Resize height giảm 10%

    // Resize và chuyển đổi ảnh sang buffer
    const resizedImage = await image.resize(width, height).toBuffer();

    // Tạo stream từ buffer đã resize
    const stream = Readable.from(resizedImage);
    // console.log(file.originalname);
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: `${Date.now()}`,
          folder: `${name}/`,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      stream.pipe(uploadStream); // Dùng buffer đã resize
    });
  }
}
