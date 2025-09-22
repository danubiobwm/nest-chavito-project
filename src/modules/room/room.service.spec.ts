import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { RoomService } from './room.service';
import { Room } from '../../entities/room.entity';
import { Building } from '../../entities/building.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RoomService', () => {
  let service: RoomService;
  let roomRepo: Repository<Room>;
  let buildingRepo: Repository<Building>;

  const mockRoom = {
    id: 1,
    name: 'Room 101',
    building: { id: 1, name: 'Main Building' },
    schedules: []
  };

  const mockBuilding = {
    id: 1,
    name: 'Main Building'
  };

  const mockRoomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn()
  };

  const mockBuildingRepository = {
    findOne: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository
        },
        {
          provide: getRepositoryToken(Building),
          useValue: mockBuildingRepository
        }
      ]
    }).compile();

    service = module.get<RoomService>(RoomService);
    roomRepo = module.get<Repository<Room>>(getRepositoryToken(Room));
    buildingRepo = module.get<Repository<Building>>(getRepositoryToken(Building));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all rooms with relations', async () => {
      const rooms = [mockRoom];
      mockRoomRepository.find.mockResolvedValue(rooms);

      const result = await service.findAll();

      expect(result).toEqual(rooms);
      expect(mockRoomRepository.find).toHaveBeenCalledWith({
        relations: ['building', 'schedules']
      });
    });

    it('should return empty array when no rooms exist', async () => {
      mockRoomRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockRoomRepository.find).toHaveBeenCalledWith({
        relations: ['building', 'schedules']
      });
    });
  });

  describe('findOne', () => {
    it('should return a room by id', async () => {
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);

      const result = await service.findOne(1);

      expect(result).toEqual(mockRoom);
      expect(mockRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['building', 'schedules']
      });
    });

    it('should throw NotFoundException when room not found', async () => {
      mockRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Room 999 not found');
    });
  });

  describe('create', () => {
    const createDto: CreateRoomDto = {
      name: 'New Room',
      buildingId: 1
    };

    it('should create a new room', async () => {
      const newRoom = {
        id: 2,
        name: 'New Room',
        building: mockBuilding,
        schedules: []
      };

      mockBuildingRepository.findOne.mockResolvedValue(mockBuilding);
      mockRoomRepository.create.mockReturnValue(newRoom);
      mockRoomRepository.save.mockResolvedValue(newRoom);

      const result = await service.create(createDto);

      expect(result).toEqual(newRoom);
      expect(mockBuildingRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.buildingId }
      });
      expect(mockRoomRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        building: mockBuilding
      });
      expect(mockRoomRepository.save).toHaveBeenCalledWith(newRoom);
    });

    it('should throw NotFoundException when building not found', async () => {
      mockBuildingRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      await expect(service.create(createDto)).rejects.toThrow('Building 1 not found');
    });

    it('should create room with correct name and building association', async () => {
      const customBuilding = { id: 2, name: 'Science Building' };
      const customDto: CreateRoomDto = {
        name: 'Lab A',
        buildingId: 2
      };
      const newRoom = {
        id: 3,
        name: 'Lab A',
        building: customBuilding,
        schedules: []
      };

      mockBuildingRepository.findOne.mockResolvedValue(customBuilding);
      mockRoomRepository.create.mockReturnValue(newRoom);
      mockRoomRepository.save.mockResolvedValue(newRoom);

      const result = await service.create(customDto);

      expect(result.name).toBe('Lab A');
      expect(result.building.id).toBe(2);
      expect(result.building.name).toBe('Science Building');
    });
  });

  describe('update', () => {
    const updateDto: UpdateRoomDto = {
      name: 'Updated Room Name',
      buildingId: 2
    };

    const updatedRoom = {
      ...mockRoom,
      name: 'Updated Room Name',
      building: { id: 2, name: 'Science Building' }
    };

    it('should update a room with all fields', async () => {
      const newBuilding = { id: 2, name: 'Science Building' };

      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockBuildingRepository.findOne.mockResolvedValue(newBuilding);
      mockRoomRepository.save.mockResolvedValue(updatedRoom);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedRoom);
      expect(mockRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['building', 'schedules']
      });
      expect(mockBuildingRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateDto.buildingId }
      });
      expect(mockRoomRepository.save).toHaveBeenCalledWith(updatedRoom);
    });

    it('should update only name when buildingId is not provided', async () => {
      const partialDto: UpdateRoomDto = {
        name: 'Partial Update'
      };
      const partiallyUpdatedRoom = {
        ...mockRoom,
        name: 'Partial Update'
      };

      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockRoomRepository.save.mockResolvedValue(partiallyUpdatedRoom);

      const result = await service.update(1, partialDto);

      expect(result.name).toBe('Partial Update');
      expect(result.building).toEqual(mockRoom.building); // unchanged
      expect(mockBuildingRepository.findOne).not.toHaveBeenCalled();
    });

    it('should update only building when name is not provided', async () => {
      const partialDto: UpdateRoomDto = {
        buildingId: 2
      };
      const newBuilding = { id: 2, name: 'Science Building' };
      const partiallyUpdatedRoom = {
        ...mockRoom,
        building: newBuilding
      };

      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockBuildingRepository.findOne.mockResolvedValue(newBuilding);
      mockRoomRepository.save.mockResolvedValue(partiallyUpdatedRoom);

      const result = await service.update(1, partialDto);

      expect(result.name).toBe(mockRoom.name); // unchanged
      expect(result.building.id).toBe(2);
      expect(result.building.name).toBe('Science Building');
    });

    it('should handle empty update dto without changes', async () => {
      const emptyDto: UpdateRoomDto = {};

      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockRoomRepository.save.mockResolvedValue(mockRoom);

      const result = await service.update(1, emptyDto);

      expect(result).toEqual(mockRoom);
      expect(mockBuildingRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when room to update not found', async () => {
      mockRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(999, updateDto)).rejects.toThrow('Room 999 not found');
    });

    it('should throw NotFoundException when new building not found', async () => {
      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockBuildingRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, updateDto)).rejects.toThrow('Building 2 not found');
    });
  });

  describe('remove', () => {
    it('should delete a room successfully', async () => {
      mockRoomRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(1);

      expect(mockRoomRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when room to delete not found', async () => {
      mockRoomRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('Room 999 not found');
    });


  });

  // Testes de integração entre métodos
  describe('integration tests', () => {

    it('should create and then delete a room', async () => {
      const createDto: CreateRoomDto = {
        name: 'Temporary Room',
        buildingId: 1
      };
      const newRoom = {
        id: 20,
        name: 'Temporary Room',
        building: mockBuilding,
        schedules: []
      };

      // Create
      mockBuildingRepository.findOne.mockResolvedValue(mockBuilding);
      mockRoomRepository.create.mockReturnValue(newRoom);
      mockRoomRepository.save.mockResolvedValue(newRoom);
      await service.create(createDto);

      // Delete
      mockRoomRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);
      await service.remove(20);

      expect(mockRoomRepository.delete).toHaveBeenCalledWith(20);
    });
  });

  describe('edge cases', () => {
    it('should handle room names with special characters', async () => {
      const createDto: CreateRoomDto = {
        name: 'Room 101-A (Lab)',
        buildingId: 1
      };
      const newRoom = {
        id: 30,
        name: 'Room 101-A (Lab)',
        building: mockBuilding,
        schedules: []
      };

      mockBuildingRepository.findOne.mockResolvedValue(mockBuilding);
      mockRoomRepository.create.mockReturnValue(newRoom);
      mockRoomRepository.save.mockResolvedValue(newRoom);

      const result = await service.create(createDto);

      expect(result.name).toBe('Room 101-A (Lab)');
    });

    it('should handle updating to same building', async () => {
      const updateDto: UpdateRoomDto = {
        buildingId: 1 // same building
      };

      mockRoomRepository.findOne.mockResolvedValue(mockRoom);
      mockBuildingRepository.findOne.mockResolvedValue(mockBuilding);
      mockRoomRepository.save.mockResolvedValue(mockRoom);

      const result = await service.update(1, updateDto);

      expect(result.building.id).toBe(1);
      expect(mockBuildingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
  });
});