import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from '../../entities/professor.entity';
import { ProfessorService } from './professor.service';
import { ProfessorController } from './professor.controller';
import { Department } from '../../entities/department.entity';
import { Title } from '../../entities/title.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Professor, Department, Title])],
  providers: [ProfessorService],
  controllers: [ProfessorController],
  exports: [ProfessorService],
})
export class ProfessorModule {}
