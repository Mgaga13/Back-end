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
} from '@nestjs/common';
import { BrannersService } from './branners.service';
import { CreateBrannerDto } from './dto/create-branner.dto';
import { UpdateBrannerDto } from './dto/update-branner.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { pick } from 'src/commom/utils/helper';
import { Public } from 'src/auth/decorators/auth.decorator';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { PageBannerDto } from './dto/page-branner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@UseGuards(JwtAuthGuard)
@Controller('v1/banner')
export class BrannersController {
  constructor(
    private readonly brannersService: BrannersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseInterceptors(FileInterceptor('image'))
  @Post('')
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBrannerDto: CreateBrannerDto,
  ) {
    const uploadResults = await this.cloudinaryService.uploadToCloudinary(
      'banner',
      file,
    );
    createBrannerDto.image = uploadResults.url;
    return this.brannersService.create(createBrannerDto);
  }

  @Get('/all')
  @Public()
  findAll(@Query() pageOptionsDto: PageBannerDto) {
    const options = pick(pageOptionsDto, [
      'page',
      'limit',
      'sort',
      'order',
      'searchText',
    ]);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.brannersService.findAll(options);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brannersService.findOne(id);
  }

  @UseInterceptors(FileInterceptor('image'))
  @Post('/update')
  async update(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateBrannerDto: UpdateBrannerDto,
  ) {
    const uploadResults = await this.cloudinaryService.uploadToCloudinary(
      'banner',
      file,
    );
    updateBrannerDto.image = uploadResults.url;
    return this.brannersService.update(updateBrannerDto.id, updateBrannerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brannersService.remove(id);
  }
}
