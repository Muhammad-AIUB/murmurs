import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity';
import { CreateMurmurDto } from './dto/create-murmur.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class MurmursService {
  constructor(
    @InjectRepository(Murmur)
    private murmurRepository: Repository<Murmur>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  /**
   * Create a new murmur for the current user
   */
  async create(createMurmurDto: CreateMurmurDto, userId: number): Promise<Murmur> {
    const murmur = this.murmurRepository.create({
      text: createMurmurDto.text,
      userId,
      likeCount: 0,
    });

    return await this.murmurRepository.save(murmur);
  }

  /**
   * Delete a murmur (only if user owns it)
   */
  async remove(id: number, userId: number): Promise<void> {
    const murmur = await this.murmurRepository.findOne({
      where: { id },
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${id} not found`);
    }

    // Check if the user owns this murmur
    if (murmur.userId !== userId) {
      throw new ForbiddenException('You can only delete your own murmurs');
    }

    await this.murmurRepository.remove(murmur);
  }

  /**
   * Find a murmur by ID
   */
  async findOne(id: number): Promise<Murmur> {
    const murmur = await this.murmurRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${id} not found`);
    }

    return murmur;
  }

  /**
   * Get timeline murmurs (from users that current user follows)
   * Supports pagination
   */
  async getTimeline(userId: number, paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    // Get list of user IDs that the current user follows
    const follows = await this.followRepository.find({
      where: { followerId: userId },
      select: ['followedId'],
    });

    const followedUserIds = follows.map((follow) => follow.followedId);

    // If user doesn't follow anyone, return empty result
    if (followedUserIds.length === 0) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Get total count of murmurs from followed users
    const total = await this.murmurRepository.count({
      where: { userId: In(followedUserIds) },
    });

    // Get paginated murmurs from followed users
    const murmurs = await this.murmurRepository.find({
      where: { userId: In(followedUserIds) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Format response
    const data = murmurs.map((murmur) => ({
      id: murmur.id,
      text: murmur.text,
      likeCount: murmur.likeCount,
      userId: murmur.userId,
      userName: murmur.user.name,
      createdAt: murmur.createdAt,
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
