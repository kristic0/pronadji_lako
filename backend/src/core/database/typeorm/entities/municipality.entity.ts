import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { City } from './city.entity';

@Entity({ name: 'municipality' })
export class Municipality {
  @PrimaryGeneratedColumn({ name: 'opstina_maticni_broj', type: 'int' })
  opstinaId: number;

  @Column({ name: 'opstina_ime_lat', length: 100 })
  opstinaName: string;

  @OneToMany(() => City, (city) => city.municipality)
  cities: City[];
}
