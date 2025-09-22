import { HoursPerProfessorDto } from './dto/hours-per-professor.dto';
import { RoomsScheduleDto } from './dto/rooms-schedule.dto';

describe('Reports DTOs', () => {
  describe('HoursPerProfessorDto', () => {
    it('should create instance with correct properties', () => {
      const dto: HoursPerProfessorDto = {
        id: 1,
        name: 'Test Professor',
        hours_per_week: 15.5
      };

      expect(dto.id).toBe(1);
      expect(dto.name).toBe('Test Professor');
      expect(dto.hours_per_week).toBe(15.5);
    });
  });

  describe('RoomsScheduleDto', () => {
    it('should create instance with correct properties', () => {
      const dto: RoomsScheduleDto = {
        room_id: 1,
        room_name: 'Room 101',
        day_of_week: 'MONDAY',
        start_time: '08:00:00',
        end_time: '10:00:00',
        class_id: 1
      };

      expect(dto.room_id).toBe(1);
      expect(dto.room_name).toBe('Room 101');
      expect(dto.day_of_week).toBe('MONDAY');
      expect(dto.start_time).toBe('08:00:00');
      expect(dto.end_time).toBe('10:00:00');
      expect(dto.class_id).toBe(1);
    });

    it('should handle null values', () => {
      const dto: RoomsScheduleDto = {
        room_id: 2,
        room_name: 'Empty Room',
        day_of_week: null,
        start_time: null,
        end_time: null,
        class_id: null
      };

      expect(dto.room_id).toBe(2);
      expect(dto.room_name).toBe('Empty Room');
      expect(dto.day_of_week).toBeNull();
      expect(dto.start_time).toBeNull();
      expect(dto.end_time).toBeNull();
      expect(dto.class_id).toBeNull();
    });
  });
});