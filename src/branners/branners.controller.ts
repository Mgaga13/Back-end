import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BrannersService } from './branners.service';
import { CreateBrannerDto } from './dto/create-branner.dto';
import { UpdateBrannerDto } from './dto/update-branner.dto';

@Controller('v1/branners')
export class BrannersController {
  constructor(private readonly brannersService: BrannersService) {}

  @Post()
  create(@Body() createBrannerDto: CreateBrannerDto) {
    return this.brannersService.create(createBrannerDto);
  }

  @Get()
  findAll() {
    return this.brannersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brannersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrannerDto: UpdateBrannerDto) {
    return this.brannersService.update(id, updateBrannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brannersService.remove(id);
  }
}
