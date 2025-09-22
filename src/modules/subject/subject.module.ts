import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from '../../entities/subject.entity';
import { Professor } from '../../entities/professor.entity';
import { SubjectPrerequisite } from '../../entities/subject-prerequisite.entity';
import { Class } from '../../entities/class.entity';
import { SubjectService } from './subject.service';
import { SubjectController } from './subject.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Professor, SubjectPrerequisite, Class])],
  providers: [SubjectService],
  controllers: [SubjectController],
  exports: [SubjectService],
})
export class SubjectModule {}
