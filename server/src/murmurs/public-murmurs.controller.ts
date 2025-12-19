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

  /**
   * GET /api/murmurs/
   * Get timeline murmurs (from users that current user follows)
   * Supports pagination with ?page=1&limit=10
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getTimeline(@Query() paginationDto: PaginationDto) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    return this.murmursService.getTimeline(currentUserId, paginationDto);
  }

  /**
   * GET /api/murmurs/:id
   * Get murmur detail by ID
   */
  @Get(':id')
  async getMurmur(@Param('id', ParseIntPipe) id: number) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    const murmur = await this.murmursService.findOne(id);
    
    // Check if current user has liked this murmur
    const like = await this.likeRepository.findOne({
      where: { userId: currentUserId, murmurId: id },
    });
    
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      userName: murmur.user.name,
      // TypeORM already handles timestamp conversion
      // Just return as ISO string - frontend will handle timezone conversion
      createdAt: murmur.createdAt instanceof Date 
        ? murmur.createdAt.toISOString() 
        : new Date(murmur.createdAt).toISOString(),
      isLiked: !!like,
    };
  }

  /**
   * POST /api/murmurs/:id/like
   * Like a murmur
   */
  @Post(':id/like')
  async like(@Param('id', ParseIntPipe) id: number) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    const murmur = await this.likesService.like(id, currentUserId);
    
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      // TypeORM already handles timestamp conversion
      // Just return as ISO string - frontend will handle timezone conversion
      createdAt: murmur.createdAt instanceof Date 
        ? murmur.createdAt.toISOString() 
        : new Date(murmur.createdAt).toISOString(),
      message: 'Murmur liked successfully',
    };
  }

  /**
   * DELETE /api/murmurs/:id/like
   * Unlike a murmur
   */
  @Delete(':id/like')
  async unlike(@Param('id', ParseIntPipe) id: number) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    const murmur = await this.likesService.unlike(id, currentUserId);
    
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      // TypeORM already handles timestamp conversion
      // Just return as ISO string - frontend will handle timezone conversion
      createdAt: murmur.createdAt instanceof Date 
        ? murmur.createdAt.toISOString() 
        : new Date(murmur.createdAt).toISOString(),
      message: 'Murmur unliked successfully',
    };
  }
}
