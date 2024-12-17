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
import { PageUserDto } from './dto/page-user.dto';
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
  async findAll(options: PageUserDto): Promise<any> {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.userRepository.createQueryBuilder('users');

    queryBuilder
      .where('users.isDeleted = :isDeleted', { isDeleted: false })
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.role',
        'users.avatar',
        'users.phone',
      ]);
    console.log(options);
    if (options.searchText) {
      queryBuilder.andWhere('users.email LIKE :searchText', {
        searchText: `%${options.searchText}%`, // Adding % for LIKE pattern matching
      });
    }
    queryBuilder
      .orderBy(`users.${options.sort}`, options.order)
      .skip(skip)
      .take(options.limit)
      .getMany();
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

  async findOneByName(name: string) {
    const user = await this.userRepository.findOne({
      where: {
        name: name,
      },
    });
    if (user) {
      throw new HttpException(
        'Not find name in list User',
        HttpStatus.NOT_FOUND,
      );
    }
    delete user.password;
    return user;
  }

  findOneByEmailAndRefeshToken(
    email: string,
    refresh_token: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email: email, refreshToken: refresh_token },
    });
  }

  async update(updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(updateUserDto.id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return await this.userRepository.update(updateUserDto.id, updateUserDto);
  }

  async updateRefreshToken(email: string, refresh_token: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return await this.userRepository.update(user.id, {
      refreshToken: refresh_token,
    });
  }
  async remove(id: string) {
    const user = await this.findOneById(id);
    return this.userRepository.update(id, { isDeleted: true });
  }
}
