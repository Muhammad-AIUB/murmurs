import { Controller, Get, Post, Delete, Param, Query, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LikesService } from './likes.service';
import { MurmursService } from './murmurs.service';
import { Like } from '../entities/like.entity';
import { PaginationDto } from './dto/pagination.dto';

@Controller('api/murmurs')
export class PublicMurmursController {
  constructor(
    private readonly likesService: LikesService,
    private readonly murmursService: MurmursService,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTimeline(@Query() paginationDto: PaginationDto) {
    const currentUserId = 1;
    return this.murmursService.getTimeline(currentUserId, paginationDto);
  }

  @Get(':id')
  async getMurmur(@Param('id', ParseIntPipe) id: number) {
    const currentUserId = 1;
    const murmur = await this.murmursService.findOne(id);
    
    const like = await this.likeRepository.findOne({
      where: { userId: currentUserId, murmurId: id },
    });
    
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      userName: murmur.user.name,
      createdAt: murmur.createdAt instanceof Date 
        ? murmur.createdAt.toISOString() 
        : new Date(murmur.createdAt).toISOString(),
      isLiked: !!like,
    };
  }

  @Post(':id/like')
  async like(@Param('id', ParseIntPipe) id: number) {
    const currentUserId = 1;
    const murmur = await this.likesService.like(id, currentUserId);
    
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      createdAt: murmur.createdAt instanceof Date 
        ? murmur.createdAt.toISOString() 
        : new Date(murmur.createdAt).toISOString(),
      message: 'Murmur liked successfully',
    };
  }

  @Delete(':id/like')
  async unlike(@Param('id', ParseIntPipe) id: number) {
    const currentUserId = 1;
    const murmur = await this.likesService.unlike(id, currentUserId);
    
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      createdAt: murmur.createdAt instanceof Date 
        ? murmur.createdAt.toISOString() 
        : new Date(murmur.createdAt).toISOString(),
      message: 'Murmur unliked successfully',
    };
  }
}
