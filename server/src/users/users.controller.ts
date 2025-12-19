import { Controller, Get, Post, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser() {
    return this.usersService.getCurrentUser();
  }

  @Get('users/:id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    const currentUserId = 1;
    return this.usersService.findOne(id, currentUserId);
  }

  @Get('users/:id/murmurs')
  async getUserMurmurs(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserMurmurs(id);
  }

  @Post('users/:id/follow')
  async follow(@Param('id', ParseIntPipe) id: number) {
    const currentUserId = 1;
    await this.usersService.follow(currentUserId, id);
    return { message: 'Successfully followed user' };
  }

  @Delete('users/:id/follow')
  async unfollow(@Param('id', ParseIntPipe) id: number) {
    const currentUserId = 1;
    await this.usersService.unfollow(currentUserId, id);
    return { message: 'Successfully unfollowed user' };
  }
}
