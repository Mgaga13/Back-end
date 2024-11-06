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
import { DataSource } from 'typeorm';

@Injectable()
export class UsersService {
  private userRepository;
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
  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find();
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
