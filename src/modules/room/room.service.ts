import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../../entities/room.entity';
import { Building } from '../../entities/building.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,

    @InjectRepository(Building)
    private buildingRepo: Repository<Building>,
  ) {}

  async findAll(): Promise<Room[]> {
    return this.roomRepo.find({ relations: ['building', 'schedules'] });
  }

  async findOne(id: number): Promise<Room> {
    const room = await this.roomRepo.findOne({ where: { id }, relations: ['building', 'schedules'] });
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    return room;
  }

  async create(dto: CreateRoomDto): Promise<Room> {
    const building = await this.buildingRepo.findOne({ where: { id: dto.buildingId } });
    if (!building) throw new NotFoundException(`Building ${dto.buildingId} not found`);

    const room = this.roomRepo.create({
      name: dto.name,
      building,
    });

    return this.roomRepo.save(room);
  }

  async update(id: number, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);

    if (dto.name !== undefined) room.name = dto.name;

    if (dto.buildingId !== undefined) {
      const building = await this.buildingRepo.findOne({ where: { id: dto.buildingId } });
      if (!building) throw new NotFoundException(`Building ${dto.buildingId} not found`);
      room.building = building;
    }

    return this.roomRepo.save(room);
  }

  async remove(id: number): Promise<void> {
    const result = await this.roomRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Room ${id} not found`);
  }
}
