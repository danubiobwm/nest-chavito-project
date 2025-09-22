import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportsModule } from './modules/reports/reports.module';
import { DepartmentModule } from './modules/department/department.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { BuildingModule } from './modules/building/building.module';
import { RoomModule } from './modules/room/room.module';
import { SubjectModule } from './modules/subject/subject.module';
import { ClassModule } from './modules/class/class.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'chavito',
      password: process.env.DB_PASSWORD || 'chavito',
      database: process.env.DB_DATABASE || 'chavito',
      autoLoadEntities: true,
      synchronize: true,
    }),
    DepartmentModule,
    ProfessorModule,
    BuildingModule,
    RoomModule,
    SubjectModule,
    ClassModule,
    ReportsModule,
  ],
})
export class AppModule {}
