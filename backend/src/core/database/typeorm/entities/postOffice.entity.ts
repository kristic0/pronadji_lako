import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { City } from './city.entity';

@Entity({ name: 'postOffice' })
export class PostOffice {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    unsigned: true,
  })
  postOfficeId: number;

  @Column({ nullable: false })
  administrativeUnit: string;

  @Column({ nullable: false })
  postOfficeZIP: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: true, default: null })
  number: string;

  @Column({ nullable: true })
  subNumber: string;

  @Column('decimal', { precision: 22, scale: 20, nullable: false, default: 0 })
  lat: number;

  @Column('decimal', { precision: 22, scale: 20, nullable: false, default: 0 })
  long: number;

  // @ManyToOne(() => City, (city) => city.postOffices)
  // city: City;

  constructor(init?: Partial<PostOffice>) {
    Object.assign(this, init);
  }
}
