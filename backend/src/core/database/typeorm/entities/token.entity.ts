import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'token' })
export class Token {
  @PrimaryGeneratedColumn({ name: 'token_id', type: 'bigint', unsigned: true })
  tokenId: number;

  @ManyToOne(() => User, (user) => user.token)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  token: string;

  @Column()
  isValid: boolean;

  constructor(user?: User, token?: string, isValid: boolean = false) {
    if (user) this.user = user;
    if (token) this.token = token;
    this.isValid = isValid;
  }
}
