import { User } from '@prisma/client';
import { CreateUserDto } from '../../dtos/create-user.dto';

export interface IUserRepository {
    create(data: CreateUserDto): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}
