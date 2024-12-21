import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { PageUserDto } from './dto/page-user.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';
import { PageDto } from 'src/commom/dto/page.dto';
const bcrypt = require('bcryptjs');
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
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    delete user.password;
    delete user.refreshToken;
    return user;
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
    return this.userRepository.update(id, { isDeleted: true });
  }

  async resetTokenSendEmail(dataReset: {
    user: any;
    resetPasswordToken: string;
    tokenCreatedAt: Date;
  }) {
    const updatedUser = {
      ...dataReset.user,
      resetPasswordToken: dataReset.resetPasswordToken,
      tokenCreatedAt: dataReset.tokenCreatedAt,
    };

    return this.userRepository.save(updatedUser);
  }
  public async findOneByToken(token: string, newPassword): Promise<any> {
    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
        isDeleted: false,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid link');
    }
    const timeToCheck = new Date(user.tokenCreatedAt);
    const currentTime = new Date();
    if (currentTime.getTime() > timeToCheck.getTime()) {
      throw new BadRequestException('Token is expired');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = {
      ...user,
      password: hashedPassword,
      resetPasswordToken: null,
      tokenCreatedAt: null,
    };
    return this.userRepository.save(updatedUser);
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });
    return user;
  }
  async updatePassword(id: string, newPassword: string) {
    return await this.userRepository.update(id, {
      password: newPassword,
    });
  }
}
