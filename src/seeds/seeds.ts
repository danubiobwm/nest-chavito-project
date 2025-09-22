import { DataSource } from 'typeorm';
import { Department } from '../entities/department.entity';
import { Professor } from '../entities/professor.entity';
import { Title } from '../entities/title.entity';
import { Building } from '../entities/building.entity';
import { Room } from '../entities/room.entity';
import { Subject } from '../entities/subject.entity';
import { Class } from '../entities/class.entity';
import { ClassSchedule } from '../entities/class-schedule.entity';
import { SubjectPrerequisite } from '../entities/subject-prerequisite.entity';


import ormconfig = require('../../ormconfig');


(async () => {
const ds = new DataSource({ ...ormconfig, synchronize: true });
await ds.initialize();


const dep = ds.getRepository(Department).create({ name: 'Humanidades' });
await ds.getRepository(Department).save(dep);


const title = ds.getRepository(Title).create({ name: 'Professor' });
await ds.getRepository(Title).save(title);


const girafales = ds.getRepository(Professor).create({
name: 'Profesor Girafales',
department: dep,
title,
isDirector: true,
});
await ds.getRepository(Professor).save(girafales);


const building = ds.getRepository(Building).create({ name: 'Prédio A' });
await ds.getRepository(Building).save(building);


const room = ds.getRepository(Room).create({ name: 'Sala 101', building });
await ds.getRepository(Room).save(room);


const subject = ds.getRepository(Subject).create({
subject_id: 'SUB001',
code: 'MAT101',
name: 'Matemática Básica',
taught_by: girafales,
});
await ds.getRepository(Subject).save(subject);


const class1 = ds.getRepository(Class).create({
subject,
year: 2025,
semester: '1',
code: 'MAT101-A',
});
await ds.getRepository(Class).save(class1);


const sched = ds.getRepository(ClassSchedule).create({
class: class1,
room,
day_of_week: 'MON',
start_time: '08:00:00',
end_time: '10:00:00',
});
await ds.getRepository(ClassSchedule).save(sched);


console.log('Seed completed!');
process.exit(0);
})();