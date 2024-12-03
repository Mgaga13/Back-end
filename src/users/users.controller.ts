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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/decorators/roler.decorator';
import { UserRole } from 'src/commom/utils/constants';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { pick } from 'src/commom/utils/helper';
import { PageProductDto } from './dto/page-product.dto';

@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  // @Public()
  findAll(pageOptionsDto: PageProductDto) {
    const options = pick(pageOptionsDto, ['page', 'limit', 'sort', 'order']);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.usersService.findAll(options);
  }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(id);
  // }
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(id, updateUserDto);
  // }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}