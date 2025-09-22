import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Subject } from './subject.entity';
import { ClassSchedule } from './class-schedule.entity';


@Entity()
export class Class {
@PrimaryGeneratedColumn()
id: number;


@ManyToOne(() => Subject, s => s.classes)
subject: Subject;


@Column({ nullable: true })
year: number;


@Column({ nullable: true })
semester: string;


@Column({ nullable: true })
code: string;


@OneToMany(() => ClassSchedule, cs => cs.class)
schedules: ClassSchedule[];
}