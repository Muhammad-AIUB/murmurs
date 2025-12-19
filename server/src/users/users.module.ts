import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { Murmur } from '../entities/murmur.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Murmur])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
