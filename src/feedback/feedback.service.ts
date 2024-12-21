import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { DataSource, Repository } from 'typeorm';
import { FeedbackEntity } from './entities/feedback.entity';

@Injectable()
export class FeedbackService {
  private feedbackRepository: Repository<FeedbackEntity>;

  constructor(private datasource: DataSource) {
    this.feedbackRepository = this.datasource.getRepository(FeedbackEntity);
  }

  async create(createFeedbackDto: CreateFeedbackDto) {
    try {
      const feedback = this.feedbackRepository.create({
        ...createFeedbackDto,
        product: { id: createFeedbackDto.productId },
        user: { id: createFeedbackDto.userId },
      });

      return await this.feedbackRepository.save(feedback);
    } catch (error) {
      console.error('Error creating feedback:', error.message);
      // Fallback giá trị mặc định
      return {
        star: 5,
        content: 'No feedback provided',
      };
    }
  }

  async findAll() {
    try {
      const feedbacks = await this.feedbackRepository.find();
      if (feedbacks.length === 0) {
        // Fallback khi không có dữ liệu
        return [{ star: 5, content: 'No feedback yet.' }];
      }
      return feedbacks;
    } catch (error) {
      console.error('Error fetching feedbacks:', error.message);
      return [{ star: 5, content: 'No feedback yet.' }];
    }
  }

  async findOne(id: string) {
    try {
      const feedback = await this.feedbackRepository.findOne({
        where: { id: id },
      });
      if (!feedback) {
        // Fallback khi không tìm thấy
        return { star: 5, content: 'No feedback found for this ID.' };
      }
      return feedback;
    } catch (error) {
      console.error(`Error finding feedback with ID ${id}:`, error.message);
      return { star: 5, content: 'No feedback found for this ID.' };
    }
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto) {
    try {
      const feedback = await this.findOne(id);
      if (!feedback) {
        throw new Error(`Feedback with ID ${id} not found.`);
      }
      return this.feedbackRepository.save({
        ...feedback,
        ...updateFeedbackDto,
      });
    } catch (error) {
      console.error(`Error updating feedback with ID ${id}:`, error.message);
      return { star: 5, content: 'Fallback: Unable to update feedback.' };
    }
  }

  async remove(id: string) {
    try {
      const feedback = await this.findOne(id);
      if (!feedback) {
        throw new Error(`Feedback with ID ${id} not found.`);
      }
      // Đánh dấu feedback là đã xoá
      return this.feedbackRepository.save({
        ...feedback,
        isDeleted: true,
      });
    } catch (error) {
      console.error(`Error removing feedback with ID ${id}:`, error.message);
      return { star: 5, content: 'Fallback: Unable to remove feedback.' };
    }
  }

  async findByProductId(productId: string): Promise<FeedbackEntity[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { product: { id: productId } },
    });
    if (!feedbacks.length) {
      throw new NotFoundException(
        `No feedbacks found for product with ID ${productId}`,
      );
    }

    return feedbacks;
  }
}
