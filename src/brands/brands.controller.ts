import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Roles } from 'src/auth/decorators/roler.decorator';
import { UserRole } from 'src/commom/utils/constants';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { pick } from 'src/commom/utils/helper';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard)
@Controller('v1/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  create(@Body() createBrandDto: CreateBrandDto) {
    console.log(createBrandDto);
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @Public()
  findAll(@Body() pageOptionsDto: PageOptionsDto) {
    const options = pick(pageOptionsDto, ['page', 'limit', 'sort', 'order']);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.brandsService.findAll(options);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Post('/edit')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  update(@Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(updateBrandDto.id, updateBrandDto);
  }
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}
