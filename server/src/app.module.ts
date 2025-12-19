import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { Murmur } from './entities/murmur.entity';
import { Follow } from './entities/follow.entity';
import { Like } from './entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'docker',
      password: 'docker',
      database: 'test',
      entities: [User, Murmur, Follow, Like],
      synchronize: true,
      logging: true,
    }),
    TypeOrmModule.forFeature([User, Murmur, Follow, Like]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
