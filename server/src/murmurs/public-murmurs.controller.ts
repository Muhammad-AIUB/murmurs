import { Controller, Get, Post, Delete, Param, Query, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { LikesService } from './likes.service';
import { MurmursService } from './murmurs.service';
import { PaginationDto } from './dto/pagination.dto';

@Controller('api/murmurs')
export class PublicMurmursController {
  constructor(
    private readonly likesService: LikesService,
    private readonly murmursService: MurmursService,
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
    const murmur = await this.murmursService.findOne(id);
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      userName: murmur.user.name,
      createdAt: murmur.createdAt,
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
      createdAt: murmur.createdAt,
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
      createdAt: murmur.createdAt,
      message: 'Murmur unliked successfully',
    };
  }
}
