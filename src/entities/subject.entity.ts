import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Building } from './building.entity';
import { Professor } from './professor.entity';
import { Class } from './class.entity';
import { SubjectPrerequisite } from './subject-prerequisite.entity';


@Entity()
export class Subject {
@PrimaryGeneratedColumn()
id: number;


@Column()
subject_id: string;


@Column()
code: string;


@Column()
name: string;


@ManyToOne(() => Building, { nullable: true })
@JoinColumn({ name: 'buildingId' })
building: Building;


@ManyToOne(() => Professor, p => p.subjects, { nullable: true })
@JoinColumn({ name: 'taught_byId' })
taught_by: Professor;


@OneToMany(() => SubjectPrerequisite, sp => sp.subject)
prerequisites: SubjectPrerequisite[];


@OneToMany(() => Class, c => c.subject)
classes: Class[];
}