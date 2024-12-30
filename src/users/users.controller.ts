import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
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
import { PageUserDto } from './dto/page-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChangePassword } from '../auth/dto/change-pass.dto';

@UseGuards(JwtAuthGuard)
@Controller('v1/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseInterceptors(FileInterceptor('avatar'))
  @Post()
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto,
  ) {
    let uploadResults = null;
    if (file) {
      uploadResults = await this.cloudinaryService.uploadToCloudinary(
        'avatar',
        file,
      );
      createUserDto.avatar = uploadResults.url;
    }
    return this.usersService.create(createUserDto);
  }
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('/update')
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    let uploadResults = null;
    if (file) {
      uploadResults = await this.cloudinaryService.uploadToCloudinary(
        'avatar',
        file,
      );
      updateUserDto.avatar = uploadResults.url;
    }
    return this.usersService.update(updateUserDto);
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('/update/profile')
  async updateProfile(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log('here');
    const user = req['user'];
    let uploadResults = null;
    if (file) {
      uploadResults = await this.cloudinaryService.uploadToCloudinary(
        'avatar',
        file,
      );
      updateUserDto.avatar = uploadResults.url;
    }
    updateUserDto.id = user.id;
    return this.usersService.update(updateUserDto);
  }
  @Get('/all')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  // @Public()
  findAll(@Query() pageOptionsDto: PageUserDto) {
    const options = pick(pageOptionsDto, [
      'page',
      'limit',
      'sort',
      'order',
      'searchText',
    ]);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.usersService.findAll(options);
  }
  @Get('/profile')
  findUserProfile(@Req() req) {
    const user = req['user'];
    return this.usersService.findOneById(user.id);
  }
  @Get(':name')
  findOneByName(@Param('name') name: string) {
    return this.usersService.findOneByName(name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
