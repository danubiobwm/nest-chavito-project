import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Professor } from './professor.entity';


@Entity()
export class Title {
@PrimaryGeneratedColumn()
id: number;


@Column()
name: string;


@OneToMany(() => Professor, p => p.title)
professors: Professor[];
}