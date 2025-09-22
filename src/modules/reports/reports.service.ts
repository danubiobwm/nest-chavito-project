import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professor } from '../../entities/professor.entity';
import { ClassSchedule } from '../../entities/class-schedule.entity';
import { Room } from '../../entities/room.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Professor) private profRepo: Repository<Professor>,
    @InjectRepository(ClassSchedule) private schedRepo: Repository<ClassSchedule>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
  ) {}

  async hoursPerProfessor(): Promise<any> {
    return this.profRepo.query(`
      SELECT p.id, p.name,
        COALESCE(SUM(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))/3600),0) as hours_per_week
      FROM professor p
      LEFT JOIN subject s ON s."taught_byId" = p.id
      LEFT JOIN "class" c ON c."subjectId" = s.id
      LEFT JOIN class_schedule cs ON cs."classId" = c.id
      GROUP BY p.id, p.name
      ORDER BY p.name;
    `);
  }

  async roomsSchedule(): Promise<any> {
    return this.roomRepo.query(`
      SELECT r.id as room_id, r.name as room_name, cs.day_of_week, cs.start_time, cs.end_time, c.id as class_id
      FROM room r
      LEFT JOIN class_schedule cs ON cs."roomId" = r.id
      LEFT JOIN "class" c ON c.id = cs."classId"
      ORDER BY r.id, cs.day_of_week, cs.start_time;
    `);
  }
}
