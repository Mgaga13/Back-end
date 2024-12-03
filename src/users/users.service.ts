import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { PageProductDto } from './dto/page-product.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';
import { PageDto } from 'src/commom/dto/page.dto';

@Injectable()
export class UsersService {
  private userRepository: Repository<UserEntity>;

  constructor(private dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(UserEntity);
  }
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('email already exists');
    }
    return await this.userRepository.save(createUserDto);
  }
  async findAll(options: PageProductDto): Promise<any> {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.userRepository.createQueryBuilder('users');

    queryBuilder
      .where('users.isDeleted = :isDeleted', { isDeleted: false })
      // .andWhere(
      //   'users.name ILIKE :q OR plants.commonName ILIKE :q OR plants.botanicalName ILIKE :q',
      //   { q: `%${filter.q}%` },
      // )
      .select([
        'users.id',
        'users.name',
        'users.commonName',
        'users.botanicalName',
        'users.plantType',
        'users.thumbnail',
        'users.images',
      ])
      .orderBy(`users.${options.sort}`, options.order)
      .skip(skip)
      .take(options.limit);

    // if (Object.keys(filter).length !== 0) {
    //   Object.keys(filter).forEach((key: string) => {
    //     if (!['q', 'limit', 'page', 'order', 'sort'].includes(key)) {
    //       queryBuilder.andWhere(`users.${key} ILIKE :${key}`, {
    //         [key]: `%${filter[key]}%`,
    //       });
    //     }
    //   });
    // }

    const itemCount: number = await queryBuilder.getCount();

    const { entities } = await queryBuilder
      .getRawAndEntities()
      .catch((error: any) => {
        throw new BadRequestException(error);
      });

    const pageMetaDto: PageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: options,
    });

    return new PageDto<UserEntity>(entities, pageMetaDto);
    // return await this.userRepository.find();
  }
  async findOneByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }
  async findOneById(id: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  findOneByEmailAndRefeshToken(
    email: string,
    refresh_token: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email: email, refreshToken: refresh_token },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return await this.userRepository.update(id, updateUserDto);
  }
  async updateRefreshToken(email: string, refresh_token: string) {
    const user = await this.findOneByEmail(email);
    console.log(user);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return await this.userRepository.update(user.id, {
      refreshToken: refresh_token,
    });
  }
  remove(id: number) {
    return this.userRepository.update(id, { isDeleted: true });
  }
}
