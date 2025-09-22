import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { SubjectService } from './subject.service';
import { Subject } from '../../entities/subject.entity';
import { Professor } from '../../entities/professor.entity';
import { SubjectPrerequisite } from '../../entities/subject-prerequisite.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('SubjectService', () => {
  let service: SubjectService;
  let subjectRepo: Repository<Subject>;
  let professorRepo: Repository<Professor>;
  let prereqRepo: Repository<SubjectPrerequisite>;

  const mockSubject = {
    id: 1,
    subject_id: 'MATH101',
    code: 'CS101',
    name: 'Introduction to Mathematics',
    taught_by: { id: 1, name: 'John Doe' },
    prerequisites: [],
    classes: []
  };

  const mockProfessor = {
    id: 1,
    name: 'John Doe'
  };

  const mockPrerequisite = {
    id: 1,
    subject: { id: 1, name: 'Advanced Math' },
    prerequisite: { id: 2, name: 'Basic Math' }
  };

  const mockSubjectRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    create: jest.fn()
  };

  const mockProfessorRepository = {
    findOne: jest.fn()
  };

  const mockPrereqRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectService,
        {
          provide: getRepositoryToken(Subject),
          useValue: mockSubjectRepository
        },
        {
          provide: getRepositoryToken(Professor),
          useValue: mockProfessorRepository
        },
        {
          provide: getRepositoryToken(SubjectPrerequisite),
          useValue: mockPrereqRepository
        }
      ]
    }).compile();

    service = module.get<SubjectService>(SubjectService);
    subjectRepo = module.get<Repository<Subject>>(getRepositoryToken(Subject));
    professorRepo = module.get<Repository<Professor>>(getRepositoryToken(Professor));
    prereqRepo = module.get<Repository<SubjectPrerequisite>>(getRepositoryToken(SubjectPrerequisite));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all subjects with relations', async () => {
      const subjects = [mockSubject];
      mockSubjectRepository.find.mockResolvedValue(subjects);

      const result = await service.findAll();

      expect(result).toEqual(subjects);
      expect(mockSubjectRepository.find).toHaveBeenCalledWith({
        relations: ['taught_by', 'prerequisites', 'classes']
      });
    });

    it('should return empty array when no subjects exist', async () => {
      mockSubjectRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a subject by id', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(mockSubject);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSubject);
      expect(mockSubjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['taught_by', 'prerequisites', 'classes']
      });
    });

    it('should throw NotFoundException when subject not found', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Subject 999 not found');
    });
  });

  describe('create', () => {
    const createDto: CreateSubjectDto = {
      subject_id: 'PHY201',
      code: 'PHY201',
      name: 'Advanced Physics',
      professorId: 1
    };

    it('should create a new subject with professor', async () => {
      const newSubject = {
        id: 2,
        ...createDto,
        taught_by: mockProfessor,
        prerequisites: [],
        classes: []
      };

      mockProfessorRepository.findOne.mockResolvedValue(mockProfessor);
      mockSubjectRepository.save.mockResolvedValue(newSubject);

      const result = await service.create(createDto);

      expect(result).toEqual(newSubject);
      expect(mockProfessorRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.professorId }
      });
      expect(mockSubjectRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        subject_id: createDto.subject_id,
        code: createDto.code,
        name: createDto.name,
        taught_by: mockProfessor
      }));
    });

    it('should create a subject without professor', async () => {
      const minimalDto: CreateSubjectDto = {
        subject_id: 'CHEM101',
        code: 'CHEM101',
        name: 'Basic Chemistry'
      };

      const newSubject = {
        id: 3,
        ...minimalDto,
        taught_by: null,
        prerequisites: [],
        classes: []
      };

      mockSubjectRepository.save.mockResolvedValue(newSubject);

      const result = await service.create(minimalDto);

      expect(result).toEqual(newSubject);
      expect(mockProfessorRepository.findOne).not.toHaveBeenCalled();
      expect(result.taught_by).toBeNull();
    });

    it('should throw NotFoundException when professor not found', async () => {
      const dtoWithInvalidProf: CreateSubjectDto = {
        subject_id: 'MATH301',
        code: 'MATH301',
        name: 'Advanced Mathematics',
        professorId: 999
      };

      mockProfessorRepository.findOne.mockResolvedValue(null);

      await expect(service.create(dtoWithInvalidProf)).rejects.toThrow(NotFoundException);
      await expect(service.create(dtoWithInvalidProf)).rejects.toThrow('Professor 999 not found');
    });
  });

  describe('update', () => {
    const updateDto: UpdateSubjectDto = {
      subject_id: 'UPDATED101',
      code: 'UPD101',
      name: 'Updated Subject',
      professorId: 2
    };

    const updatedSubject = {
      ...mockSubject,
      subject_id: 'UPDATED101',
      code: 'UPD101',
      name: 'Updated Subject',
      taught_by: { id: 2, name: 'Jane Smith' }
    };

    it('should update a subject with all fields', async () => {
      const newProfessor = { id: 2, name: 'Jane Smith' };

      mockSubjectRepository.findOne.mockResolvedValue(mockSubject);
      mockProfessorRepository.findOne.mockResolvedValue(newProfessor);
      mockSubjectRepository.save.mockResolvedValue(updatedSubject);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedSubject);
      expect(mockSubjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['taught_by', 'prerequisites', 'classes']
      });
      expect(mockProfessorRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.professorId }
      });
    });

    it('should remove professor when professorId is null', async () => {
      const dtoWithNullProfessor: UpdateSubjectDto = {
        professorId: null
      };

      const subjectWithoutProfessor = {
        ...mockSubject,
        taught_by: null
      };

      mockSubjectRepository.findOne.mockResolvedValue(mockSubject);
      mockSubjectRepository.save.mockResolvedValue(subjectWithoutProfessor);

      const result = await service.update(1, dtoWithNullProfessor);

      expect(result.taught_by).toBeNull();
      expect(mockProfessorRepository.findOne).not.toHaveBeenCalled();
    });

    it('should update partial data', async () => {
      const partialDto: UpdateSubjectDto = {
        name: 'Partial Update'
      };

      const partiallyUpdatedSubject = {
        ...mockSubject,
        name: 'Partial Update'
      };

      mockSubjectRepository.findOne.mockResolvedValue(mockSubject);
      mockSubjectRepository.save.mockResolvedValue(partiallyUpdatedSubject);

      const result = await service.update(1, partialDto);

      expect(result.name).toBe('Partial Update');
      expect(result.subject_id).toBe(mockSubject.subject_id); // unchanged
      expect(result.code).toBe(mockSubject.code); // unchanged
    });

    it('should throw NotFoundException when subject to update not found', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new professor not found', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(mockSubject);
      mockProfessorRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, updateDto)).rejects.toThrow('Professor 2 not found');
    });
  });

  describe('remove', () => {
    it('should delete a subject successfully', async () => {
      mockSubjectRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(1);

      expect(mockSubjectRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when subject to delete not found', async () => {
      mockSubjectRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('Subject 999 not found');
    });
  });

  describe('addPrerequisite', () => {
    const createPrereqDto: CreatePrerequisiteDto = {
      subjectId: 1,
      prerequisiteId: 2
    };

    it('should add a prerequisite relation', async () => {
      const subject = { id: 1, name: 'Advanced Math' };
      const prerequisite = { id: 2, name: 'Basic Math' };
      const newPrerequisite = {
        id: 1,
        subject,
        prerequisite
      };

      mockSubjectRepository.findOne
        .mockResolvedValueOnce(subject) // First call for subject
        .mockResolvedValueOnce(prerequisite); // Second call for prerequisite

      mockPrereqRepository.findOne.mockResolvedValue(null); // No existing prerequisite
      mockPrereqRepository.create.mockReturnValue(newPrerequisite);
      mockPrereqRepository.save.mockResolvedValue(newPrerequisite);

      const result = await service.addPrerequisite(createPrereqDto);

      expect(result).toEqual(newPrerequisite);
      expect(mockSubjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: createPrereqDto.subjectId }
      });
      expect(mockSubjectRepository.findOne).toHaveBeenCalledWith({
        where: { id: createPrereqDto.prerequisiteId }
      });
      expect(mockPrereqRepository.findOne).toHaveBeenCalledWith({
        where: { subject: { id: subject.id }, prerequisite: { id: prerequisite.id } }
      });
    });

    it('should throw NotFoundException when subject not found', async () => {
      mockSubjectRepository.findOne.mockResolvedValue(null); // Subject not found

      await expect(service.addPrerequisite(createPrereqDto)).rejects.toThrow(NotFoundException);
      await expect(service.addPrerequisite(createPrereqDto)).rejects.toThrow('Subject 1 not found');
    });


  });

  describe('removePrerequisite', () => {
    it('should remove a prerequisite relation', async () => {
      mockPrereqRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.removePrerequisite(1);

      expect(mockPrereqRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when prerequisite relation not found', async () => {
      mockPrereqRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.removePrerequisite(999)).rejects.toThrow(NotFoundException);
      await expect(service.removePrerequisite(999)).rejects.toThrow('SubjectPrerequisite 999 not found');
    });
  });

  // Testes de integração
  describe('integration tests', () => {
    it('should create subject, add prerequisite, and then remove it', async () => {
      // Create subject
      const createDto: CreateSubjectDto = {
        subject_id: 'TEST101',
        code: 'TEST101',
        name: 'Test Subject'
      };
      const newSubject = { id: 10, ...createDto, taught_by: null, prerequisites: [], classes: [] };

      mockSubjectRepository.save.mockResolvedValue(newSubject);
      const createdSubject = await service.create(createDto);

      // Add prerequisite
      const prereqDto: CreatePrerequisiteDto = {
        subjectId: 10,
        prerequisiteId: 2
      };
      const prerequisiteSubject = { id: 2, name: 'Prerequisite Subject' };
      const newPrereq = { id: 5, subject: newSubject, prerequisite: prerequisiteSubject };

      mockSubjectRepository.findOne
        .mockResolvedValueOnce(newSubject)
        .mockResolvedValueOnce(prerequisiteSubject);
      mockPrereqRepository.findOne.mockResolvedValue(null);
      mockPrereqRepository.create.mockReturnValue(newPrereq);
      mockPrereqRepository.save.mockResolvedValue(newPrereq);

      const addedPrereq = await service.addPrerequisite(prereqDto);

      // Remove prerequisite
      mockPrereqRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);
      await service.removePrerequisite(5);

      expect(createdSubject.id).toBe(10);
      expect(addedPrereq.id).toBe(5);
      expect(addedPrereq.subject.id).toBe(10);
      expect(addedPrereq.prerequisite.id).toBe(2);
    });


  });
});