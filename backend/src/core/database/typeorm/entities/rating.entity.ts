import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'rating' })
export class Rating {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  seekerId: number;

  @Column({ type: 'tinyint' })
  rating: number;

  @ManyToOne(() => User, (user) => user.ratings)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
