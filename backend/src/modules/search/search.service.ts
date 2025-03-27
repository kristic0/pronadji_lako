import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from 'src/core/database/typeorm/entities/city.entity';
import { DataSource, Repository } from 'typeorm';
import { SearchParamDto } from './dto/SearchParam.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Street } from 'src/core/database/typeorm/entities/street.entity';
import { CoordinatesResponseDto } from './dto/CoordinatesResponse.dto';
import { cyrillicToLatin } from 'src/common/cyrillicToLatin';
import { User } from 'src/core/database/typeorm/entities/user.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(City) private cityRepository: Repository<City>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
    private readonly httpService: HttpService,
  ) {}

  // async searchPostOffice(query: SearchParamDto): Promise<any {
  //   const sql = `
  //     SELECT city_name, postOfficeZIP, opstina, name, address, lat, \`long\`
  //     FROM pronadji_lako.city
  //     INNER JOIN postOffice ON pronadji_lako.city.city_id = pronadji_lako.postOffice.cityCityId
  //     WHERE city_name LIKE ?
  //     ORDER BY
  //       CASE
  //         WHEN city_name = 'BEOGRAD' THEN 0
  //         WHEN city_name = 'NOVI SAD' THEN 1
  //         WHEN city_name = 'NIS' THEN 2
  //         WHEN city_name = 'KRAGUJEVAC' THEN 3
  //         WHEN city_name = 'SUBOTICA' THEN 4
  //         WHEN city_name = 'KRUSEVAC' THEN 5
  //         WHEN city_name = 'ZRENJANIN' THEN 6
  //         WHEN city_name = 'PANCEVO' THEN 7
  //         ELSE 8
  //       END,
  //       city_name ASC
  //   `;
  //   return await this.dataSource.query(sql, [`${query.q}%`]);
  // }

  async getAllStreetsFromCity(cityId: number) {
    const sql = `select * from street where street.naselje_maticni_broj = ?`;
    try {
      return await this.dataSource.query(sql, [cityId]);
    } catch (err) {
      throw err;
    }
  }

  async findNannyNearby(id: number) {
    const user = await this.userRepository.findOneBy({ userId: id });
    if (!user) throw new NotFoundException('User not found!');

    const sql = `
    SELECT 
      user_id,
      name, 
      lastname,
      profile_image,
      address,
      c.naselje_ime_lat,
      pricePerHour,
      isNanny, 
      (6371  * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(lat)) *
          COS(RADIANS(\`long\`) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(lat))
      )) AS distance
      FROM 
          user
      JOIN city c ON user.cityCityId = c.naselje_maticni_broj
      WHERE user.isNanny = true
      ORDER BY 
          distance ASC;`;

    return await this.dataSource.query(sql, [user.lat, user.long, user.lat]);
  }

  async findCity(query?: SearchParamDto): Promise<City[]> {
    const sqlAllCities = `SELECT naselje_maticni_broj, naselje_ime_lat as name, opstina_ime_lat
    FROM city c
    JOIN municipality m ON c.opstina_maticni_broj = m.opstina_maticni_broj
    ORDER BY 
        CASE
          WHEN naselje_ime_lat LIKE 'BEOGRAD%' THEN 1
          WHEN naselje_ime_lat LIKE 'NOVI SAD%' THEN 2
          WHEN naselje_ime_lat LIKE 'NIS' THEN 3
          WHEN naselje_ime_lat LIKE 'KRAGUJEVAC%' THEN 4
          WHEN naselje_ime_lat LIKE 'SUBOTICA%' THEN 5
          WHEN naselje_ime_lat LIKE 'PANCEVO%' THEN 6
          WHEN naselje_ime_lat LIKE 'NOVI PAZAR%' THEN 7
          WHEN naselje_ime_lat LIKE 'CACAK%' THEN 8
          WHEN naselje_ime_lat LIKE 'KRUSEVAC%' THEN 9
          WHEN naselje_ime_lat LIKE 'ZRENJANIN%' THEN 10
          WHEN naselje_ime_lat LIKE 'LESKOVAC%' THEN 11
          WHEN naselje_ime_lat LIKE 'KRALJEVO%' THEN 12
          WHEN naselje_ime_lat LIKE 'VALJEVO%' THEN 13
          WHEN naselje_ime_lat LIKE 'SREMSKA MITROVICA%' THEN 14
          WHEN naselje_ime_lat LIKE 'SMEDEREVO%' THEN 15
          ELSE 20
        END,
        naselje_ime_lat`;

    const sqlSearchCity = `
      SELECT city.naselje_maticni_broj, city.naselje_ime_lat as name, municipality.opstina_ime_lat 
      FROM city
      JOIN municipality ON city.opstina_maticni_broj  = municipality.opstina_maticni_broj 
      WHERE naselje_ime_lat LIKE CONCAT('%', ?, '%')
      ORDER BY 
          CASE
            WHEN naselje_ime_lat LIKE 'BEOGRAD%' THEN 1
            WHEN naselje_ime_lat LIKE 'NOVI SAD%' THEN 2
            WHEN naselje_ime_lat LIKE 'NIS' THEN 3
            WHEN naselje_ime_lat LIKE 'KRAGUJEVAC%' THEN 4
            WHEN naselje_ime_lat LIKE 'SUBOTICA%' THEN 5
            WHEN naselje_ime_lat LIKE 'PANCEVO%' THEN 6
            WHEN naselje_ime_lat LIKE 'NOVI PAZAR%' THEN 7
            WHEN naselje_ime_lat LIKE 'CACAK%' THEN 8
            WHEN naselje_ime_lat LIKE 'KRUSEVAC%' THEN 9
            WHEN naselje_ime_lat LIKE 'ZRENJANIN%' THEN 10
            WHEN naselje_ime_lat LIKE 'LESKOVAC%' THEN 11
            WHEN naselje_ime_lat LIKE 'KRALJEVO%' THEN 12
            WHEN naselje_ime_lat LIKE 'VALJEVO%' THEN 13
            WHEN naselje_ime_lat LIKE 'SREMSKA MITROVICA%' THEN 14
            WHEN naselje_ime_lat LIKE 'SMEDEREVO%' THEN 15
            WHEN naselje_ime_lat LIKE CONCAT(?, '%') THEN 16
            ELSE 20
          END,
          naselje_ime_lat
      LIMIT 15;
      `;

    if (query) {
      return await this.dataSource.query(sqlSearchCity, [query.q, query.q]);
    }

    return await this.dataSource.query(sqlAllCities);
  }

  async findCityById(id: number): Promise<City> {
    return await this.cityRepository.findOneBy({ cityId: id });
  }

  async findStreet(query: SearchParamDto): Promise<Street[]> {
    const sql = `
      SELECT ulica_ime_lat
      FROM street
      WHERE ulica_ime_lat LIKE CONCAT(?, '%')
      GROUP BY ulica_ime_lat
      ORDER BY
        COUNT(*) DESC,
        ulica_ime_lat LIKE CONCAT(?, '%') DESC,
        LOCATE(LOWER(?), LOWER(ulica_ime_lat)),
        ulica_ime_lat
      LIMIT 15;
    `;
    return await this.dataSource.query(sql, [query.q, query.q, query.q]);
  }

  async findCoordinates(address: string, mustSet?: boolean): Promise<CoordinatesResponseDto> {
    try {
      const res = await firstValueFrom(
        this.httpService.get(
          `http://localhost:8080/search?q=${address}&format=json&accept-language=sr-Latn`,
        ),
      );

      if (res.data.length === 0) {
        return <CoordinatesResponseDto>{
          display_name: 'Not Found',
          lat: 0,
          long: 0,
        };
      }

      return <CoordinatesResponseDto>{
        display_name: cyrillicToLatin(res.data[0]['display_name']),
        lat: res.data[0]['lat'],
        long: res.data[0]['lon'],
      };
    } catch (error) {
      throw error;
    }
  }
}
