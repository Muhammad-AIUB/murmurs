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

  async like(murmurId: number, userId: number): Promise<Murmur> {
    const murmur = await this.murmurRepository.findOne({
      where: { id: murmurId },
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${murmurId} not found`);
    }

    const existingLike = await this.likeRepository.findOne({
      where: { userId, murmurId },
    });

    if (existingLike) {
      throw new ConflictException('You have already liked this murmur');
    }

    try {
      const like = this.likeRepository.create({
        userId,
        murmurId,
      });

      await this.likeRepository.save(like);

      await this.murmurRepository.increment(
        { id: murmurId },
        'likeCount',
        1,
      );
    } catch (error) {
      if (error instanceof QueryFailedError && error.message.includes('Duplicate entry')) {
        throw new ConflictException('You have already liked this murmur');
      }
      throw error;
    }

    return await this.murmurRepository.findOne({
      where: { id: murmurId },
    }) as Murmur;
  }

  async unlike(murmurId: number, userId: number): Promise<Murmur> {
    const murmur = await this.murmurRepository.findOne({
      where: { id: murmurId },
    });

    if (!murmur) {
      throw new NotFoundException(`Murmur with ID ${murmurId} not found`);
    }

    const existingLike = await this.likeRepository.findOne({
      where: { userId, murmurId },
    });

    if (!existingLike) {
      throw new NotFoundException('Like not found');
    }

    await this.likeRepository.remove(existingLike);

    await this.murmurRepository.decrement(
      { id: murmurId },
      'likeCount',
      1,
    );

    return await this.murmurRepository.findOne({
      where: { id: murmurId },
    }) as Murmur;
  }
}
