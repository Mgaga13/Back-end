import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PageProductDto } from './dto/page-product.dto';
import { pick } from 'src/commom/utils/helper';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PageFilterProductDto } from './dto/page-product.filter.dto';

@Controller('v1/product')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // @Post()
  // create(@Body() createProductDto: CreateProductDto) {
  //   return this.productsService.create(createProductDto);
  // }

  @Post('')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createProductDto: CreateProductDto,
  ) {
    const uploadResults = await this.cloudinaryService.uploadMultipleFiles(
      'products',
      files,
    );
    const image = uploadResults.map((val) => val.url);
    createProductDto.image = image;
    return this.productsService.create(createProductDto);
  }

  @Get('/list')
  @HttpCode(200)
  findAll(@Query() pageOptionsDto: PageProductDto) {
    const options = pick(pageOptionsDto, [
      'page',
      'limit',
      'sort',
      'order',
      'searchText',
    ]);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.productsService.findAllProducts(options);
  }

  @Post('/list')
  @HttpCode(200)
  findAllHome(@Body() pageOptionsDto: PageFilterProductDto) {
    const options = pick(pageOptionsDto, [
      'page',
      'limit',
      'sort',
      'order',
      'searchText',
      'categoryId',
      'brandId',
      'sortPrice',
    ]);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.productsService.findAllProductsUser(options);
  }

  @Get('top-selling')
  async getTopSellingProducts(@Query('limit') limit = 10) {
    return this.productsService.getTopSellingProducts(limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('/update')
  @UseInterceptors(FilesInterceptor('files', 10))
  async update(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const uploadResults = await this.cloudinaryService.uploadMultipleFiles(
      'products',
      files,
    );
    const image = uploadResults.map((val) => val.url);
    updateProductDto.image = image;
    return this.productsService.update(updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
