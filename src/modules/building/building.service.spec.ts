import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BuildingService } from './building.service';
import { Building } from '../../entities/building.entity';
import { NotFoundException } from '@nestjs/common';

const buildingArray = [
  { id: 1, name: 'A', rooms: [] },
  { id: 2, name: 'B', rooms: [] },
];

describe('BuildingService', () => {
  let service: BuildingService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue(buildingArray),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildingService,
        { provide: getRepositoryToken(Building), useValue: repo },
      ],
    }).compile();

    service = module.get<BuildingService>(BuildingService);
  });

  it('should return all buildings', async () => {
    expect(await service.findAll()).toEqual(buildingArray);
    expect(repo.find).toHaveBeenCalledWith({ relations: ['rooms'] });
  });

  it('should return one building', async () => {
    repo.findOne.mockResolvedValue(buildingArray[0]);
    expect(await service.findOne(1)).toEqual(buildingArray[0]);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['rooms'] });
  });

  it('should throw NotFoundException if building not found', async () => {
    repo.findOne.mockResolvedValue(undefined);
    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should create a building', async () => {
    const dto = { name: 'C' };
    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue({ id: 3, ...dto });
    expect(await service.create(dto)).toEqual({ id: 3, name: 'C' });
    expect(repo.create).toHaveBeenCalledWith({ name: dto.name });
    expect(repo.save).toHaveBeenCalledWith(dto);
  });

  it('should update a building', async () => {
    repo.update.mockResolvedValue(undefined);
    repo.findOne.mockResolvedValue(buildingArray[0]);
    expect(await service.update(1, { name: 'Updated' })).toEqual(buildingArray[0]);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'Updated' });
  });

  it('should remove a building', async () => {
    repo.delete.mockResolvedValue(undefined);
    await service.remove(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});