import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Follow } from '../entities/follow.entity';
import { Murmur } from '../entities/murmur.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Murmur)
    private murmurRepository: Repository<Murmur>,
  ) {}

  /**
   * Find user by ID with follower/following counts
   */
  async findOne(id: number, currentUserId?: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Get follower count (how many users follow this user)
    const followerCount = await this.followRepository.count({
      where: { followedId: id },
    });

    // Get following count (how many users this user follows)
    const followingCount = await this.followRepository.count({
      where: { followerId: id },
    });

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const follow = await this.followRepository.findOne({
        where: { followerId: currentUserId, followedId: id },
      });
      isFollowing = !!follow;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      followerCount,
      followingCount,
      isFollowing,
      createdAt: user.createdAt,
    };
  }

  /**
   * Get current user profile (for /api/me endpoint)
   * TODO: Replace hardcoded ID with authenticated user ID when auth is implemented
   */
  async getCurrentUser(): Promise<any> {
    // For now, return user ID 1 as current user
    // This will be replaced with actual authentication later
    const currentUserId = 1;
    return this.findOne(currentUserId);
  }

  /**
   * Follow a user
   */
  async follow(followerId: number, followedId: number): Promise<void> {
    if (followerId === followedId) {
      throw new ConflictException('Cannot follow yourself');
    }

    const user = await this.userRepository.findOne({
      where: { id: followedId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${followedId} not found`);
    }

    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followedId },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    const follow = this.followRepository.create({
      followerId,
      followedId,
    });

    await this.followRepository.save(follow);
  }

  /**
   * Unfollow a user
   */
  async unfollow(followerId: number, followedId: number): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followedId },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
  }

  /**
   * Get user's murmurs
   */
  async getUserMurmurs(userId: number): Promise<Murmur[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.murmurRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
