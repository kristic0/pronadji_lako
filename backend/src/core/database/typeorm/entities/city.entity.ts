import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { PostOffice } from './postOffice.entity';
import { Municipality } from './municipality.entity';
import { Street } from './street.entity';

@Entity({ name: 'city' })
export class City {
  @PrimaryGeneratedColumn({ name: 'naselje_maticni_broj', type: 'int' })
  cityId: number;

  @Column({ name: 'naselje_ime_lat', length: 100 })
  cityName: string;

  @ManyToOne(() => Municipality, (municipality) => municipality.cities, { nullable: false })
  @JoinColumn({ name: 'opstina_maticni_broj' })
  municipality: Municipality;

  @OneToMany(() => User, (user) => user.city)
  users: User[];

  @OneToMany(() => City, (city) => city.municipality)
  cities: City[];

  @OneToMany(() => Street, (street) => street.city)
  streets: Street[];

  // @OneToMany(() => PostOffice, (postOffice) => postOffice.city)
  // postOffices: PostOffice[];
}
