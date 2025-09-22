import { AppDataSource } from '../data-source';
import { Department } from '../entities/department.entity';
import { Professor } from '../entities/professor.entity';
import { Title } from '../entities/title.entity';
import { Subject } from '../entities/subject.entity';
import { Class } from '../entities/class.entity';
import { Room } from '../entities/room.entity';
import { ClassSchedule } from '../entities/class-schedule.entity';
import { Building } from '../entities/building.entity';
import { SubjectPrerequisite } from '../entities/subject-prerequisite.entity';

async function seed() {
  const ds = await AppDataSource.initialize();

  // Repositórios
  const depRepo = ds.getRepository(Department);
  const profRepo = ds.getRepository(Professor);
  const titleRepo = ds.getRepository(Title);
  const subjRepo = ds.getRepository(Subject);
  const classRepo = ds.getRepository(Class);
  const roomRepo = ds.getRepository(Room);
  const schedRepo = ds.getRepository(ClassSchedule);
  const buildingRepo = ds.getRepository(Building);
  const prereqRepo = ds.getRepository(SubjectPrerequisite);

  // --- Department
  const dep = depRepo.create({ name: 'Matemática' });
  await depRepo.save(dep);

  // --- Title
  const title = titleRepo.create({ name: 'Mestre' });
  await titleRepo.save(title);

  // --- Professor
  const girafales = profRepo.create({
    name: 'Professor Girafales',
    department: dep,
    title,
  });
  await profRepo.save(girafales);

  // --- Building
  const building = buildingRepo.create({ name: 'Bloco A' });
  await buildingRepo.save(building);

  // --- Room
  const room101 = roomRepo.create({ name: 'Sala 101', building });
  await roomRepo.save(room101);

  // --- Subject
  const math = subjRepo.create({
    subject_id: 'MATH101',
    code: 'MAT101',
    name: 'Álgebra Básica',
    taught_by: girafales,
  });
  await subjRepo.save(math);

  // --- Class
  const algebraClass = classRepo.create({
    year: 2025,
    semester: '1',
    code: 'MAT101-A',
  });
  algebraClass.subject = math;
  await classRepo.save(algebraClass);

  const schedule = schedRepo.create({
    class: algebraClass,
    room: room101,
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '10:00',
  });
  await schedRepo.save(schedule);

  const prereq = prereqRepo.create({
    subject: math,
    prerequisite: math,
  });
  await prereqRepo.save(prereq);

  console.log(' Seed executado com sucesso!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error(' Erro ao rodar seed:', err);
});
