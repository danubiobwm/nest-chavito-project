import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessorService } from './professor.service';
import { Professor } from '../../entities/professor.entity';
import { Department } from '../../entities/department.entity';
import { Title } from '../../entities/title.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProfessorService', () => {
  let service: ProfessorService;
  let professorRepo: Repository<Professor>;
  let departmentRepo: Repository<Department>;
  let titleRepo: Repository<Title>;

  const mockProfessor = {
    id: 1,
    name: 'John Doe',
    isDirector: false,
    department: { id: 1, name: 'Computer Science' },
    title: { id: 1, name: 'PhD' },
    subjects: []
  };

  const mockDepartment = {
    id: 1,
    name: 'Computer Science'
  };

  const mockTitle = {
    id: 1,
    name: 'PhD'
  };

  const mockProfessorRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn()
  };

  const mockDepartmentRepository = {
    findOne: jest.fn()
  };

  const mockTitleRepository = {
    findOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessorService,
        {
          provide: getRepositoryToken(Professor),
          useValue: mockProfessorRepository
        },
        {
          provide: getRepositoryToken(Department),
          useValue: mockDepartmentRepository
        },
        {
          provide: getRepositoryToken(Title),
          useValue: mockTitleRepository
        }
      ]
    }).compile();

    service = module.get<ProfessorService>(ProfessorService);
    professorRepo = module.get<Repository<Professor>>(getRepositoryToken(Professor));
    departmentRepo = module.get<Repository<Department>>(getRepositoryToken(Department));
    titleRepo = module.get<Repository<Title>>(getRepositoryToken(Title));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all professors with relations', async () => {
      const professors = [mockProfessor];
      mockProfessorRepository.find.mockResolvedValue(professors);

      const result = await service.findAll();

      expect(result).toEqual(professors);
      expect(mockProfessorRepository.find).toHaveBeenCalledWith({
        relations: ['department', 'title', 'subjects']
      });
    });

    it('should return empty array when no professors exist', async () => {
      mockProfessorRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a professor by id', async () => {
      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProfessor);
      expect(mockProfessorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['department', 'title', 'subjects']
      });
    });

    it('should throw NotFoundException when professor not found', async () => {
      mockProfessorRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Professor 999 not found');
    });
  });

  describe('create', () => {
    const createDto: CreateProfessorDto = {
      name: 'Jane Smith',
      departmentId: 1,
      titleId: 1,
      isDirector: true
    };

    it('should create a new professor with all fields', async () => {
      mockDepartmentRepository.findOne.mockResolvedValue(mockDepartment);
      mockTitleRepository.findOne.mockResolvedValue(mockTitle);
      mockProfessorRepository.save.mockResolvedValue(mockProfessor);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProfessor);
      expect(mockDepartmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.departmentId }
      });
      expect(mockTitleRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.titleId }
      });
      expect(mockProfessorRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Jane Smith',
        isDirector: true,
        department: mockDepartment,
        title: mockTitle
      }));
    });

    it('should create a professor without optional fields', async () => {
      const minimalDto: CreateProfessorDto = {
        name: 'Minimal Professor'
      };

      const minimalProfessor = {
        id: 2,
        name: 'Minimal Professor',
        isDirector: false,
        department: null,
        title: null,
        subjects: []
      };

      mockProfessorRepository.save.mockResolvedValue(minimalProfessor);

      const result = await service.create(minimalDto);

      expect(result).toEqual(minimalProfessor);
      expect(mockDepartmentRepository.findOne).not.toHaveBeenCalled();
      expect(mockTitleRepository.findOne).not.toHaveBeenCalled();
      expect(mockProfessorRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Minimal Professor',
        isDirector: false
      }));
    });

    it('should throw NotFoundException when department not found', async () => {
      const dtoWithInvalidDept: CreateProfessorDto = {
        name: 'Professor',
        departmentId: 999
      };

      mockDepartmentRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dtoWithInvalidDept)).rejects.toThrow(NotFoundException);
      await expect(service.create(dtoWithInvalidDept)).rejects.toThrow('Department 999 not found');
    });

    it('should throw NotFoundException when title not found', async () => {
      const dtoWithInvalidTitle: CreateProfessorDto = {
        name: 'Professor',
        titleId: 999
      };

      mockTitleRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dtoWithInvalidTitle)).rejects.toThrow(NotFoundException);
      await expect(service.create(dtoWithInvalidTitle)).rejects.toThrow('Title 999 not found');
    });

    it('should handle isDirector as false when not provided', async () => {
      const dtoWithoutDirector: CreateProfessorDto = {
        name: 'Professor'
      };

      const professorWithoutDirector = {
        ...mockProfessor,
        isDirector: false
      };

      mockProfessorRepository.save.mockResolvedValue(professorWithoutDirector);

      const result = await service.create(dtoWithoutDirector);

      expect(result.isDirector).toBe(false);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProfessorDto = {
      name: 'Updated Name',
      departmentId: 2,
      titleId: 2,
      isDirector: true
    };

    const updatedProfessor = {
      ...mockProfessor,
      name: 'Updated Name',
      isDirector: true,
      department: { id: 2, name: 'Mathematics' },
      title: { id: 2, name: 'Master' }
    };

    it('should update a professor with all fields', async () => {
      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);
      mockDepartmentRepository.findOne.mockResolvedValue({ id: 2, name: 'Mathematics' });
      mockTitleRepository.findOne.mockResolvedValue({ id: 2, name: 'Master' });
      mockProfessorRepository.save.mockResolvedValue(updatedProfessor);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedProfessor);
      expect(mockProfessorRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['department', 'title', 'subjects']
      });
      expect(mockDepartmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.departmentId }
      });
      expect(mockTitleRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.titleId }
      });
    });

    it('should update partial data', async () => {
      const partialDto: UpdateProfessorDto = {
        name: 'Partial Update'
      };

      const partiallyUpdatedProfessor = {
        ...mockProfessor,
        name: 'Partial Update'
      };

      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);
      mockProfessorRepository.save.mockResolvedValue(partiallyUpdatedProfessor);

      const result = await service.update(1, partialDto);

      expect(result.name).toBe('Partial Update');
      expect(result.department).toEqual(mockProfessor.department); // unchanged
      expect(result.title).toEqual(mockProfessor.title); // unchanged
    });

    it('should handle departmentId as undefined (remove department)', async () => {
      const dtoWithUndefinedDept: UpdateProfessorDto = {
        departmentId: undefined
      };

      const professorWithoutDept = {
        ...mockProfessor,
        department: null
      };

      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);
      mockProfessorRepository.save.mockResolvedValue(professorWithoutDept);

      const result = await service.update(1, dtoWithUndefinedDept);

      expect(result.department).toBeNull();
      expect(mockDepartmentRepository.findOne).not.toHaveBeenCalled();
    });

    it('should handle titleId as undefined (remove title)', async () => {
      const dtoWithUndefinedTitle: UpdateProfessorDto = {
        titleId: undefined
      };

      const professorWithoutTitle = {
        ...mockProfessor,
        title: null
      };

      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);
      mockProfessorRepository.save.mockResolvedValue(professorWithoutTitle);

      const result = await service.update(1, dtoWithUndefinedTitle);

      expect(result.title).toBeNull();
      expect(mockTitleRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when professor to update not found', async () => {
      mockProfessorRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new department not found', async () => {
      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);
      mockDepartmentRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, updateDto)).rejects.toThrow('Department 2 not found');
    });

    it('should throw NotFoundException when new title not found', async () => {
      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);
      mockDepartmentRepository.findOne.mockResolvedValue({ id: 2, name: 'Mathematics' });
      mockTitleRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, updateDto)).rejects.toThrow('Title 2 not found');
    });
  });

  describe('remove', () => {
    it('should delete a professor', async () => {
      mockProfessorRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(1);

      expect(mockProfessorRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should not throw when deleting non-existent professor', async () => {
      mockProfessorRepository.delete.mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(999)).resolves.not.toThrow();
    });
  });

  describe('hoursPerWeek', () => {
    it('should return hours per week for professors', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { id: 1, name: 'John Doe', hours_per_week: '10.5' },
          { id: 2, name: 'Jane Smith', hours_per_week: '15.0' }
        ])
      };

      mockProfessorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.hoursPerWeek();

      expect(result).toEqual([
        { id: 1, name: 'John Doe', hours_per_week: '10.5' },
        { id: 2, name: 'Jane Smith', hours_per_week: '15.0' }
      ]);

      expect(mockProfessorRepository.createQueryBuilder).toHaveBeenCalledWith('p');
      expect(mockQueryBuilder.select).toHaveBeenCalledWith(['p.id as id', 'p.name as name']);
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        "COALESCE(SUM(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))/3600),0)",
        'hours_per_week'
      );
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('p.subjects', 's');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('s.classes', 'c');
      expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('c.schedules', 'cs');
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('p.id');
    });

    it('should return empty array when no professors have hours', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([])
      };

      mockProfessorRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.hoursPerWeek();

      expect(result).toEqual([]);
    });
  });


});