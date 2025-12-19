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

  async findOne(id: number, currentUserId?: number): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const followerCount = await this.followRepository.count({
      where: { followedId: id },
    });

    const followingCount = await this.followRepository.count({
      where: { followerId: id },
    });

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

  async getCurrentUser(): Promise<any> {
    const currentUserId = 1;
    return this.findOne(currentUserId);
  }

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

  async unfollow(followerId: number, followedId: number): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followedId },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
  }

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
