import { PartialType } from '@nestjs/swagger';
import { CreateBrannerDto } from './create-branner.dto';

export class UpdateBrannerDto extends PartialType(CreateBrannerDto) {}
