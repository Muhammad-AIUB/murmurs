import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Like } from '../entities/like.entity';
import { Murmur } from '../entities/murmur.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Murmur)
    private murmurRepository: Repository<Murmur>,
  ) {}

  /**
   * Like a murmur
   * Updates likeCount atomically
   */
  async like(murmurId: number, userId: number): Promise<Murmur> {
    // Check if murmur exists
    const murmur = await this.murmurRepository.findOne({
      where: { id: murmurId },
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${murmurId} not found`);
    }

    // Check if user already liked this murmur
    const existingLike = await this.likeRepository.findOne({
      where: { userId, murmurId },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this murmur');
    }

    try {
      // Create like record
      const like = this.likeRepository.create({
        userId,
        murmurId,
      });

      await this.likeRepository.save(like);

      // Update likeCount atomically
      await this.murmurRepository.increment(
        { id: murmurId },
        'likeCount',
        1,
      );
    } catch (error) {
      // Handle unique constraint violation (race condition)
      if (error instanceof QueryFailedError && error.message.includes('Duplicate entry')) {
        throw new ConflictException('You have already liked this murmur');
      }
      throw error;
    }

    // Return updated murmur
    return await this.murmurRepository.findOne({
      where: { id: murmurId },
    }) as Murmur;
  }

  /**
   * Unlike a murmur
   * Updates likeCount atomically
   */
  async unlike(murmurId: number, userId: number): Promise<Murmur> {
    // Check if murmur exists
    const murmur = await this.murmurRepository.findOne({
      where: { id: murmurId },
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${murmurId} not found`);
    }

    // Find existing like
    const existingLike = await this.likeRepository.findOne({
      where: { userId, murmurId },
    });

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    // Remove like
    await this.likeRepository.remove(existingLike);

    // Update likeCount atomically (decrement, but don't go below 0)
    await this.murmurRepository.decrement(
      { id: murmurId },
      'likeCount',
      1,
    );

    // Return updated murmur
    return await this.murmurRepository.findOne({
      where: { id: murmurId },
    }) as Murmur;
  }
}
