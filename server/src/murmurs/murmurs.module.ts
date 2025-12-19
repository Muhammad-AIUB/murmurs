import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MurmursController } from './murmurs.controller';
import { PublicMurmursController } from './public-murmurs.controller';
import { MurmursService } from './murmurs.service';
import { LikesService } from './likes.service';
import { Murmur } from '../entities/murmur.entity';
import { Like } from '../entities/like.entity';
import { Follow } from '../entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Murmur, Like, Follow])],
  controllers: [MurmursController, PublicMurmursController],
  providers: [MurmursService, LikesService],
  exports: [MurmursService, LikesService],
})
export class MurmursModule {}
