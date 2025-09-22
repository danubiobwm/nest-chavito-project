import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { ClassService } from './class.service';
import { Class } from '../../entities/class.entity';
import { Subject } from '../../entities/subject.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { NotFoundException } from '@nestjs/common';

describe('ClassService', () => {
  let service: ClassService;
  let classRepo: Repository<Class>;
  let subjectRepo: Repository<Subject>;

  const mockClass = {
    id: 1,
    year: 2024,
    semester: 1,
    code: 'CS101-01',
    subject: { id: 1, name: 'Computer Science' },
    schedules: []
  };

  const mockSubject = {
    id: 1,
    name: 'Computer Science'
  };

  const mockClassRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn()
  };

  const mockSubjectRepository = {
    findOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassService,
        {
          provide: getRepositoryToken(Class),
          useValue: mockClassRepository
        },
        {
          provide: getRepositoryToken(Subject),
          useValue: mockSubjectRepository
        }
      ]
    }).compile();

    service = module.get<ClassService>(ClassService);
    classRepo = module.get<Repository<Class>>(getRepositoryToken(Class));
    subjectRepo = module.get<Repository<Subject>>(getRepositoryToken(Subject));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all classes with relations', async () => {
      const classes = [mockClass];
      mockClassRepository.find.mockResolvedValue(classes);

      const result = await service.findAll();

      expect(result).toEqual(classes);
      expect(mockClassRepository.find).toHaveBeenCalledWith({
        relations: ['subject', 'schedules']
      });
    });
  });

  describe('findOne', () => {
    it('should return a class by id', async () => {
      mockClassRepository.findOne.mockResolvedValue(mockClass);

      const result = await service.findOne(1);

      expect(result).toEqual(mockClass);
      expect(mockClassRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['subject', 'schedules']
      });
    });

    it('should throw NotFoundException when class not found', async () => {
      mockClassRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Class 999 not found');
    });
  });

  describe('create', () => {
    const createDto: CreateClassDto = {
      subjectId: 1,
      year: 2024,
      semester: "1",
      code: 'CS101-01'
    };

    it('should create a new class', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(mockSubject);
      mockClassRepository.create.mockReturnValue(mockClass);
      mockClassRepository.save.mockResolvedValue(mockClass);

      const result = await service.create(createDto);

      expect(result).toEqual(mockClass);
      expect(mockSubjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.subjectId }
      });
      expect(mockClassRepository.create).toHaveBeenCalledWith({
        subject: mockSubject,
        year: createDto.year,
        semester: createDto.semester,
        code: createDto.code
      });
      expect(mockClassRepository.save).toHaveBeenCalledWith(mockClass);
    });

    it('should throw NotFoundException when subject not found', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Subject 1 not found');
    });
  });

  describe('update', () => {
    const updateDto: UpdateClassDto = {
      year: 2025,
      semester: "2",
      code: 'CS101-02',
      subjectId: 2
    };

    const updatedClass = {
      ...mockClass,
      year: 2025,
      semester: 2,
      code: 'CS101-02',
      subject: { id: 2, name: 'Advanced CS' }
    };

    // it('should update a class', async () => {
    //   mockClassRepository.findOne.mockResolvedValue(mockClass);
    //   mockSubjectRepository.findOne.mockResolvedValue({ id: 2, name: 'Advanced CS' });
    //   mockClassRepository.save.mockResolvedValue(updatedClass);

    //   const result = await service.update(1, updateDto);

    //   expect(result).toEqual(updatedClass);
    //   expect(mockClassRepository.findOne).toHaveBeenCalledWith({
    //     where: { id: 1 },
    //     relations: ['subject', 'schedules']
    //   });
    //   expect(mockSubjectRepository.findOne).toHaveBeenCalledWith({
    //     where: { id: updateDto.subjectId }
    //   });
    //   expect(mockClassRepository.save).toHaveBeenCalledWith(updatedClass);
    // });

    it('should update partial data', async () => {
      const partialDto = { year: 2025 };
      const partiallyUpdatedClass = { ...mockClass, year: 2025 };

      mockClassRepository.findOne.mockResolvedValue(mockClass);
      mockClassRepository.save.mockResolvedValue(partiallyUpdatedClass);

      const result = await service.update(1, partialDto);

      expect(result.year).toBe(2025);
      expect(result.semester).toBe(mockClass.semester);
    });

    it('should throw NotFoundException when class not found', async () => {
      mockClassRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new subject not found', async () => {
      mockClassRepository.findOne.mockResolvedValue(mockClass);
      mockSubjectRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, updateDto)).rejects.toThrow('Subject 2 not found');
    });
  });

  describe('remove', () => {
    it('should delete a class', async () => {
      mockClassRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(1);

      expect(mockClassRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should not throw when deleting non-existent class', async () => {
      mockClassRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(999)).resolves.not.toThrow();
    });
  });
});