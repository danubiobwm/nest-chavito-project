import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private repo: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.repo.find({ relations: ['professors'] });
  }

  async findOne(id: number): Promise<Department> {
    const d = await this.repo.findOne({ where: { id }, relations: ['professors'] });
    if (!d) throw new NotFoundException(`Department ${id} not found`);
    return d;
  }

  async create(dto: CreateDepartmentDto): Promise<Department> {
    const dep = this.repo.create({ name: dto.name });
    return this.repo.save(dep);
  }

  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
