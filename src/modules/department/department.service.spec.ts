import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentService } from './department.service';
import { Department } from '../../entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { NotFoundException } from '@nestjs/common';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repo: Repository<Department>;

  const mockDepartment = {
    id: 1,
    name: 'Computer Science',
    professors: []
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: getRepositoryToken(Department),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    repo = module.get<Repository<Department>>(getRepositoryToken(Department));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all departments with professors relation', async () => {
      const departments = [mockDepartment];
      mockRepository.find.mockResolvedValue(departments);

      const result = await service.findAll();

      expect(result).toEqual(departments);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['professors']
      });
    });

    it('should return empty array when no departments exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['professors']
      });
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDepartment);

      const result = await service.findOne(1);

      expect(result).toEqual(mockDepartment);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['professors']
      });
    });

    it('should throw NotFoundException when department not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Department 999 not found');
    });
  });

  describe('create', () => {
    const createDto: CreateDepartmentDto = {
      name: 'Mathematics'
    };

    it('should create a new department', async () => {
      const newDepartment = {
        id: 2,
        name: createDto.name,
        professors: []
      };

      mockRepository.create.mockReturnValue(newDepartment);
      mockRepository.save.mockResolvedValue(newDepartment);

      const result = await service.create(createDto);

      expect(result).toEqual(newDepartment);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: createDto.name
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newDepartment);
    });

    it('should create department with correct name', async () => {
      const createDto: CreateDepartmentDto = {
        name: 'Physics Department'
      };

      const newDepartment = {
        id: 3,
        name: 'Physics Department',
        professors: []
      };

      mockRepository.create.mockReturnValue(newDepartment);
      mockRepository.save.mockResolvedValue(newDepartment);

      const result = await service.create(createDto);

      expect(result.name).toBe('Physics Department');
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Physics Department'
      });
    });
  });

  describe('update', () => {
    const updateDto: UpdateDepartmentDto = {
      name: 'Updated Department Name'
    };

    const updatedDepartment = {
      ...mockDepartment,
      name: 'Updated Department Name'
    };

    it('should update a department', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(updatedDepartment);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedDepartment);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['professors']
      });
    });

    it('should update department with partial data', async () => {
      const partialDto: UpdateDepartmentDto = {
        name: 'Partial Update'
      };

      const partiallyUpdatedDepartment = {
        ...mockDepartment,
        name: 'Partial Update'
      };

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(partiallyUpdatedDepartment);

      const result = await service.update(1, partialDto);

      expect(result.name).toBe('Partial Update');
      expect(mockRepository.update).toHaveBeenCalledWith(1, partialDto);
    });

    it('should throw NotFoundException when department to update not found', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(999, updateDto)).rejects.toThrow('Department 999 not found');
    });

    it('should handle empty update dto', async () => {
      const emptyDto: UpdateDepartmentDto = {};

      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(mockDepartment);

      const result = await service.update(1, emptyDto);

      expect(result).toEqual(mockDepartment);
      expect(mockRepository.update).toHaveBeenCalledWith(1, emptyDto);
    });
  });

  describe('remove', () => {
    it('should delete a department', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should not throw when deleting non-existent department', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(999)).resolves.not.toThrow();
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
    });

    it('should complete deletion without errors', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(1)).resolves.toBeUndefined();
    });
  });

  // Testes de integração entre métodos
  describe('integration tests', () => {
    it('should create and then find the same department', async () => {
      const createDto: CreateDepartmentDto = { name: 'New Department' };
      const newDepartment = { id: 10, name: 'New Department', professors: [] };

      // Mock create
      mockRepository.create.mockReturnValue(newDepartment);
      mockRepository.save.mockResolvedValue(newDepartment);

      const created = await service.create(createDto);

      // Mock findOne para retornar o departamento criado
      mockRepository.findOne.mockResolvedValue(newDepartment);

      const found = await service.findOne(10);

      expect(created).toEqual(found);
      expect(created.id).toBe(found.id);
      expect(created.name).toBe(found.name);
    });

    it('should create, update, and find the updated department', async () => {
      const createDto: CreateDepartmentDto = { name: 'Original Name' };
      const newDepartment = { id: 20, name: 'Original Name', professors: [] };
      const updatedDepartment = { id: 20, name: 'Updated Name', professors: [] };

      // Create
      mockRepository.create.mockReturnValue(newDepartment);
      mockRepository.save.mockResolvedValue(newDepartment);
      const created = await service.create(createDto);

      // Update
      const updateDto: UpdateDepartmentDto = { name: 'Updated Name' };
      mockRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockRepository.findOne.mockResolvedValue(updatedDepartment);
      const updated = await service.update(20, updateDto);

      expect(created.name).toBe('Original Name');
      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(created.id);
    });
  });
});