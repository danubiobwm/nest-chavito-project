import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from '../../entities/professor.entity';
import { ClassSchedule } from '../../entities/class-schedule.entity';
import { Subject } from '../../entities/subject.entity';
import { Class } from '../../entities/class.entity';


@Module({
imports: [TypeOrmModule.forFeature([Professor, Subject, Class, ClassSchedule])],
providers: [ReportsService],
controllers: [ReportsController],
})
export class ReportsModule {}