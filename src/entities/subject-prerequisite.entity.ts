import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Subject } from './subject.entity';


@Entity()
export class SubjectPrerequisite {
@PrimaryGeneratedColumn()
id: number;


@ManyToOne(() => Subject, s => s.prerequisites, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'subjectId' })
subject: Subject;


@ManyToOne(() => Subject, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'prerequisiteId' })
prerequisite: Subject;
}