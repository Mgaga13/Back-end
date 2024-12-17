import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TypeProductService } from './type-product.service';
import { CreateTypeProductDto } from './dto/create-type-product.dto';
import { UpdateTypeProductDto } from './dto/update-type-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roler.decorator';
import { UserRole } from 'src/commom/utils/constants';
import { pick } from 'src/commom/utils/helper';
@UseGuards(JwtAuthGuard)
@Controller('v1/type')
export class TypeProductController {
  constructor(private readonly typeProductService: TypeProductService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createTypeProductDto: CreateTypeProductDto) {
    return this.typeProductService.create(createTypeProductDto);
  }

  @Get()
  @Public()
  findAll(@Body() pageOptionsDto: PageOptionsDto) {
    const options = pick(pageOptionsDto, ['page', 'limit', 'sort', 'order']);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.typeProductService.findAll(options);
  }
  @Get(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string) {
    return this.typeProductService.findOne(id);
  }

  @Post('/edit')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  update(@Body() updateCategoryDto: UpdateTypeProductDto) {
    return this.typeProductService.update(updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.typeProductService.remove(id);
  }
}
