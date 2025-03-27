import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { City } from './city.entity';
import { Rating } from './rating.entity';
import { Token } from './token.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  userId: number;

  @Column({ length: 20, default: '' })
  name: string;

  @Column({ length: 50, default: '' })
  lastname: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: false, nullable: false })
  isNanny: boolean;

  @ManyToOne(() => City, (city) => city.users, { nullable: true, eager: true })
  city: City;

  @Column({ length: 100, nullable: true })
  address: string;

  @Column({ name: 'employment_status', length: 255, nullable: true })
  employmentStatus: string;

  @Column({ name: 'profile_image', length: 255, nullable: true })
  profileImage: string;

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  @OneToMany(() => Token, (token) => token.user)
  token: Token[];

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  pricePerHour: number;

  @Column('decimal', { precision: 22, scale: 20, nullable: false, default: 0 })
  lat: number;

  @Column('decimal', { precision: 22, scale: 20, nullable: false, default: 0 })
  long: number;

  constructor(partial?: Partial<User>) {
    Object.assign(this, partial); // Safely assign object properties to this instance
  }
}
