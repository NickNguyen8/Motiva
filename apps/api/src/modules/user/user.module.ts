import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
    controllers: [UserController],
    providers: [
        UserService,
        PrismaService,
        {
            provide: 'UserRepository',
            useClass: PrismaUserRepository,
        },
    ],
    exports: [UserService],
})
export class UserModule { }
