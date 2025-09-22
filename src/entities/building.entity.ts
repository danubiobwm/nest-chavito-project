import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Room } from './room.entity';


@Entity()
export class Building {
@PrimaryGeneratedColumn()
id: number;


@Column()
name: string;


@OneToMany(() => Room, r => r.building)
rooms: Room[];
}