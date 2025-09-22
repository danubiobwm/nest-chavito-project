import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Professor } from '../../entities/professor.entity';
import { ClassSchedule } from '../../entities/class-schedule.entity';
import { Subject } from '../../entities/subject.entity';
import { Class } from '../../entities/class.entity';


@Injectable()
export class ReportsService {
constructor(
@InjectRepository(Professor) private profRepo: Repository<Professor>,
@InjectRepository(ClassSchedule) private schedRepo: Repository<ClassSchedule>,
@InjectRepository(Subject) private subjRepo: Repository<Subject>,
@InjectRepository(Class) private classRepo: Repository<Class>,
) {}


async hoursPerProfessor() {
return this.profRepo.query(`
SELECT p.id, p.name, COALESCE(SUM(EXTRACT(EPOCH FROM (cs.end_time - cs.start_time))/3600),0) as hours_per_week
FROM professor p
LEFT JOIN subject s ON s."taughtById" = p.id
LEFT JOIN class c ON c."subjectId" = s.id
LEFT JOIN class_schedule cs ON cs."classId" = c.id
GROUP BY p.id, p.name;
`);
}


async roomsSchedule() {
return this.profRepo.query(`
SELECT r.id as room_id, r.name as room_name, cs.day_of_week, cs.start_time, cs.end_time, c.id as class_id
FROM room r
LEFT JOIN class_schedule cs ON cs."roomId" = r.id
LEFT JOIN class c ON c.id = cs."classId"
ORDER BY r.id, cs.day_of_week, cs.start_time;
`);
}
}