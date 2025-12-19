import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MurmursService } from './murmurs.service';
import { CreateMurmurDto } from './dto/create-murmur.dto';

@Controller('api/me/murmurs')
export class MurmursController {
  constructor(private readonly murmursService: MurmursService) {}

  /**
   * POST /api/me/murmurs/
   * Create a new murmur for the current user
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createMurmurDto: CreateMurmurDto) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    const murmur = await this.murmursService.create(createMurmurDto, currentUserId);
    
    return {
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      createdAt: murmur.createdAt,
    };
  }

  /**
   * DELETE /api/me/murmurs/:id/
   * Delete own murmur by ID
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    await this.murmursService.remove(id, currentUserId);
    
    return {
      message: 'Murmur deleted successfully',
    };
  }
}
