import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'passwordResetTokens' })
export class PasswordResetToken {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  id: number;

  @Column()
  email: string;

  @Column()
  token: string;

  @Column()
  createdAt: string;

  @Column()
  expires: string;

  @Column({ default: false })
  activated: boolean;

  constructor(partial?: Partial<PasswordResetToken>) {
    Object.assign(this, partial);
  }
}
