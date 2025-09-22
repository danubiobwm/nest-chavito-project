import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from '../../entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';


@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private repo: Repository<Building>,
  ) {}

  findAll() {
    return this.repo.find({ relations: ['rooms'] });
  }

  async findOne(id: number) {
    const b = await this.repo.findOne({ where: { id }, relations: ['rooms'] });
    if (!b) throw new NotFoundException(`Building ${id} not found`);
    return b;
  }

  create(dto: CreateBuildingDto) {
    const b = this.repo.create({ name: dto.name });
    return this.repo.save(b);
  }

  async update(id: number, dto: UpdateBuildingDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}
