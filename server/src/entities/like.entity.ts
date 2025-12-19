import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Column, Index } from 'typeorm';
import { User } from './user.entity';
import { Murmur } from './murmur.entity';

@Entity('likes')
@Index(['userId', 'murmurId'], { unique: true })
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  murmurId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Murmur, (murmur) => murmur.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'murmurId' })
  murmur!: Murmur;
}
