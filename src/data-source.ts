import { DataSource } from 'typeorm';
import { Department } from './entities/department.entity';
import { Professor } from './entities/professor.entity';
import { Title } from './entities/title.entity';
import { Subject } from './entities/subject.entity';
import { Class } from './entities/class.entity';
import { Room } from './entities/room.entity';
import { ClassSchedule } from './entities/class-schedule.entity';
import { Building } from './entities/building.entity';
import { SubjectPrerequisite } from './entities/subject-prerequisite.entity';

export const AppDataSource = new DataSource({
  type:  'postgres',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'chavito',
  password: process.env.DB_PASSWORD || 'chavito',
  database: process.env.DB_DATABASE || 'chavito',
  synchronize: true,
  logging: true,
  entities: [
    Department,
    Professor,
    Title,
    Subject,
    Class,
    Room,
    ClassSchedule,
    Building,
    SubjectPrerequisite,
  ],
  migrations: ['dist/migrations/*.js'],
});
