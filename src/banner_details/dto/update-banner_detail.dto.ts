import { PartialType } from '@nestjs/swagger';
import { CreateBannerDetailDto } from './create-banner_detail.dto';

export class UpdateBannerDetailDto extends PartialType(CreateBannerDetailDto) {}
