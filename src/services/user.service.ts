import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { IUserService } from '../interfaces/services/user-service.interface';
import { UsersRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';

@Injectable()
export class UsersService implements IUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(data: CreateUserDto) {
    const userExists = await this.usersRepository.findByEmail(data.email);

    if (userExists) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    return this.usersRepository.create(data);
  }

  async findAll() {
    return this.usersRepository.findAll();
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findById(id);

    return this.usersRepository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);

    await this.usersRepository.delete(id);
  }
}