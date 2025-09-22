import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../../entities/class.entity';

import { Subject } from '../../entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(Class)
    private repo: Repository<Class>,
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['subject', 'schedules'] });
  }

  async findOne(id: number) {
    const c = await this.repo.findOne({ where: { id }, relations: ['subject', 'schedules'] });
    if (!c) throw new NotFoundException(`Class ${id} not found`);
    return c;
  }

  async create(dto: CreateClassDto) {
    const subject = await this.subjectRepo.findOne({ where: { id: dto.subjectId } });
    if (!subject) throw new NotFoundException(`Subject ${dto.subjectId} not found`);

    const c = this.repo.create({
      subject,
      year: dto.year,
      semester: dto.semester,
      code: dto.code,
    });
    return this.repo.save(c);
  }

  async update(id: number, dto: UpdateClassDto) {
    const c = await this.findOne(id);
    if (dto.year !== undefined) c.year = dto.year;
    if (dto.semester !== undefined) c.semester = dto.semester;
    if (dto.code !== undefined) c.code = dto.code;
    if (dto.subjectId !== undefined) {
      const subject = await this.subjectRepo.findOne({ where: { id: dto.subjectId } });
      if (!subject) throw new NotFoundException(`Subject ${dto.subjectId} not found`);
      c.subject = subject;
    }
    return this.repo.save(c);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
