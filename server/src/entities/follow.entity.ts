import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Column, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Index(['followerId', 'followedId'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  followerId!: number;

  @Column()
  followedId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower!: User;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followedId' })
  followed!: User;
}
