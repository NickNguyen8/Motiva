import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from './domain/repositories/user.repository.interface';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @Inject('UserRepository') private readonly userRepository: IUserRepository,
    ) { }

    async create(createUserDto: CreateUserDto) {
        return this.userRepository.create(createUserDto);
    }

    async findByEmail(email: string) {
        return this.userRepository.findByEmail(email);
    }

    async findById(id: string) {
        return this.userRepository.findById(id);
    }
}
