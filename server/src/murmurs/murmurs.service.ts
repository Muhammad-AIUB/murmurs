import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity';
import { Like } from '../entities/like.entity';
import { CreateMurmurDto } from './dto/create-murmur.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class MurmursService {
  constructor(
    @InjectRepository(Murmur)
    private murmurRepository: Repository<Murmur>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
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
    
    // Include current user's own murmurs in timeline (like Twitter)
    const userIdsToInclude = [...followedUserIds, userId];

    // Get total count of murmurs from followed users + own murmurs
    const total = await this.murmurRepository.count({
      where: { userId: In(userIdsToInclude) },
    });

    // Get paginated murmurs from followed users + own murmurs
    const murmurs = await this.murmurRepository.find({
      where: { userId: In(userIdsToInclude) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Get all murmur IDs to check which ones the current user has liked
    const murmurIds = murmurs.map((m) => m.id);
    const userLikes = await this.likeRepository.find({
      where: {
        userId,
        murmurId: In(murmurIds),
      },
      select: ['murmurId'],
    });

    const likedMurmurIds = new Set(userLikes.map((like) => like.murmurId));

    // Format response
    const data = murmurs.map((murmur) => ({
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
      isLiked: likedMurmurIds.has(murmur.id),
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
