import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Professor } from '../../entities/professor.entity';
import { Subject } from '../../entities/subject.entity';
import { Class as ClassEntity } from '../../entities/class.entity';
import { ClassSchedule } from '../../entities/class-schedule.entity';
import { Room } from '../../entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Professor, Subject, ClassEntity, ClassSchedule, Room])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
