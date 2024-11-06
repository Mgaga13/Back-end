import { Injectable } from '@nestjs/common';
import { CreateBrannerDto } from './dto/create-branner.dto';
import { UpdateBrannerDto } from './dto/update-branner.dto';

@Injectable()
export class BrannersService {
  create(createBrannerDto: CreateBrannerDto) {
    return 'This action adds a new branner';
  }

  findAll() {
    return `This action returns all branners`;
  }

  findOne(id: number) {
    return `This action returns a #${id} branner`;
  }

  update(id: number, updateBrannerDto: UpdateBrannerDto) {
    return `This action updates a #${id} branner`;
  }

  remove(id: number) {
    return `This action removes a #${id} branner`;
  }
}
