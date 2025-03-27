import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'newsletter' })
export class Newsletter {
  @PrimaryGeneratedColumn({
    name: 'newsletter_id',
    type: 'bigint',
    unsigned: true,
  })
  newsletterId: number;
  @Column({ nullable: false, unique: true })
  email: string;
}
