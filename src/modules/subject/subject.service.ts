import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../../entities/subject.entity';
import { Professor } from '../../entities/professor.entity';
import { SubjectPrerequisite } from '../../entities/subject-prerequisite.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';


@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,

    @InjectRepository(Professor)
    private profRepo: Repository<Professor>,

    @InjectRepository(SubjectPrerequisite)
    private prereqRepo: Repository<SubjectPrerequisite>,
  ) {}

  async findAll(): Promise<Subject[]> {
    return this.subjectRepo.find({ relations: ['taught_by', 'prerequisites', 'classes'] });
  }

  async findOne(id: number): Promise<Subject> {
    const s = await this.subjectRepo.findOne({ where: { id }, relations: ['taught_by', 'prerequisites', 'classes'] });
    if (!s) throw new NotFoundException(`Subject ${id} not found`);
    return s;
  }

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const subject = new Subject();
    subject.subject_id = dto.subject_id;
    subject.code = dto.code;
    subject.name = dto.name;

    if (dto.professorId) {
      const prof = await this.profRepo.findOne({ where: { id: dto.professorId } });
      if (!prof) throw new NotFoundException(`Professor ${dto.professorId} not found`);
      subject.taught_by = prof;
    }

    return this.subjectRepo.save(subject);
  }

  async update(id: number, dto: UpdateSubjectDto): Promise<Subject> {
    const sub = await this.findOne(id);
    if (dto.subject_id !== undefined) sub.subject_id = dto.subject_id;
    if (dto.code !== undefined) sub.code = dto.code;
    if (dto.name !== undefined) sub.name = dto.name;

    if (dto.professorId !== undefined) {
      if (dto.professorId === null) {
        sub.taught_by = null;
      } else {
        const prof = await this.profRepo.findOne({ where: { id: dto.professorId } });
        if (!prof) throw new NotFoundException(`Professor ${dto.professorId} not found`);
        sub.taught_by = prof;
      }
    }

    return this.subjectRepo.save(sub);
  }

  async remove(id: number): Promise<void> {
    const r = await this.subjectRepo.delete(id);
    if (r.affected === 0) throw new NotFoundException(`Subject ${id} not found`);
  }

  // Add a prerequisite relation Subject -> prerequisite (both subject ids)
  async addPrerequisite(dto: CreatePrerequisiteDto) {
    const subject = await this.subjectRepo.findOne({ where: { id: dto.subjectId } });
    if (!subject) throw new NotFoundException(`Subject ${dto.subjectId} not found`);

    const prereq = await this.subjectRepo.findOne({ where: { id: dto.prerequisiteId } });
    if (!prereq) throw new NotFoundException(`Prerequisite subject ${dto.prerequisiteId} not found`);

    // avoid duplicate
    const exists = await this.prereqRepo.findOne({
      where: { subject: { id: subject.id }, prerequisite: { id: prereq.id } },
    } as any);
    if (exists) throw new BadRequestException('Prerequisite already exists for this subject');

    const sp = this.prereqRepo.create({ subject, prerequisite: prereq });
    return this.prereqRepo.save(sp);
  }

  async removePrerequisite(id: number): Promise<void> {
    const r = await this.prereqRepo.delete(id);
    if (r.affected === 0) throw new NotFoundException(`SubjectPrerequisite ${id} not found`);
  }
}
