import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { City } from './city.entity';

@Entity({ name: 'street' })
export class Street {
  @PrimaryGeneratedColumn({ name: 'ulica_id', type: 'int' })
  streetId: number;

  @Column({ name: 'ulica_ime_lat', length: 100 })
  streetName: string;

  @ManyToOne(() => City, (city) => city.streets, { nullable: false })
  @JoinColumn({ name: 'naselje_maticni_broj' })
  city: City;
}
