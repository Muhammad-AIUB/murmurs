import { Controller, Get, Post, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /api/me
   * Get current user's own profile
   */
  @Get('me')
  async getCurrentUser() {
    return this.usersService.getCurrentUser();
  }

  /**
   * GET /api/users/:id
   * Get user details by ID
   */
  @Get('users/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    return this.usersService.findOne(id, currentUserId);
  }

  /**
   * GET /api/users/:id/murmurs
   * Get user's murmurs
   */
  @Get('users/:id/murmurs')
  async getUserMurmurs(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserMurmurs(id);
  }

  /**
   * POST /api/users/:id/follow
   * Follow a user
   */
  @Post('users/:id/follow')
  async follow(@Param('id', ParseIntPipe) id: number) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    await this.usersService.follow(currentUserId, id);
    return { message: 'Successfully followed user' };
  }

  /**
   * DELETE /api/users/:id/follow
   * Unfollow a user
   */
  @Delete('users/:id/follow')
  async unfollow(@Param('id', ParseIntPipe) id: number) {
    // TODO: Replace hardcoded userId with authenticated user ID
    const currentUserId = 1;
    await this.usersService.unfollow(currentUserId, id);
    return { message: 'Successfully unfollowed user' };
  }
}
