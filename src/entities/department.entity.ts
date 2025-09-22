import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Professor } from './professor.entity';


@Entity()
export class Department {
@PrimaryGeneratedColumn()
id: number;


@Column()
name: string;


@OneToMany(() => Professor, p => p.department)
professors: Professor[];
}