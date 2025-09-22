import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professor } from '../../entities/professor.entity';

import { Department } from '../../entities/department.entity';
import { Title } from '../../entities/title.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

@Injectable()
export class ProfessorService {
  constructor(
    @InjectRepository(Professor)
    private repo: Repository<Professor>,
    @InjectRepository(Department)
    private deptRepo: Repository<Department>,
    @InjectRepository(Title)
    private titleRepo: Repository<Title>,
  ) {}

  async findAll(): Promise<Professor[]> {
    return this.repo.find({ relations: ['department', 'title', 'subjects'] });
  }

  async findOne(id: number): Promise<Professor> {
    const p = await this.repo.findOne({ where: { id }, relations: ['department', 'title', 'subjects'] });
    if (!p) throw new NotFoundException(`Professor ${id} not found`);
    return p;
  }

  async create(dto: CreateProfessorDto): Promise<Professor> {
    const prof = new Professor();
    prof.name = dto.name;
    prof.isDirector = !!dto.isDirector;

    if (dto.departmentId) {
      const dept = await this.deptRepo.findOne({ where: { id: dto.departmentId } });
      if (!dept) throw new NotFoundException(`Department ${dto.departmentId} not found`);
      prof.department = dept;
    }

    if (dto.titleId) {
      const title = await this.titleRepo.findOne({ where: { id: dto.titleId } });
      if (!title) throw new NotFoundException(`Title ${dto.titleId} not found`);
      prof.title = title;
    }

    return this.repo.save(prof);
  }

  async update(id: number, dto: UpdateProfessorDto): Promise<Professor> {
    const p = await this.findOne(id);
    if (dto.name) p.name = dto.name;
    if (typeof dto.isDirector === 'boolean') p.isDirector = dto.isDirector;

    if (dto.departmentId !== undefined) {
      const dept = await this.deptRepo.findOne({ where: { id: dto.departmentId } });
      if (!dept) throw new NotFoundException(`Department ${dto.departmentId} not found`);
      p.department = dept;
    }

    if (dto.titleId !== undefined) {
      const title = await this.titleRepo.findOne({ where: { id: dto.titleId } });
      if (!title) throw new NotFoundException(`Title ${dto.titleId} not found`);
      p.title = title;
    }

    return this.repo.save(p);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async hoursPerWeek() {
    const qb = this.repo.createQueryBuilder('p')
      .select(['p.id as id', 'p.name as name'])
      .addSelect("COALESCE(SUM(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))/3600),0)", 'hours_per_week')
      .leftJoin('p.subjects', 's')
      .leftJoin('s.classes', 'c')
      .leftJoin('c.schedules', 'cs')
      .groupBy('p.id');

    return qb.getRawMany();
  }
}
