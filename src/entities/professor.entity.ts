import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Department } from './department.entity';
import { Title } from './title.entity';
import { Subject } from './subject.entity';


@Entity()
export class Professor {
@PrimaryGeneratedColumn()
id: number;


@Column()
name: string;


@ManyToOne(() => Department, d => d.professors, { nullable: true })
@JoinColumn({ name: 'departmentId' })
department: Department;


@ManyToOne(() => Title, t => t.professors, { nullable: true })
@JoinColumn({ name: 'titleId' })
title: Title;


@Column({ default: false })
isDirector: boolean;


@OneToMany(() => Subject, s => s.taught_by)
subjects: Subject[];
}