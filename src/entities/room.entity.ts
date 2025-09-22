import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Building } from './building.entity';
import { ClassSchedule } from './class-schedule.entity';


@Entity()
export class Room {
@PrimaryGeneratedColumn()
id: number;


@Column()
name: string;


@ManyToOne(() => Building, b => b.rooms)
@JoinColumn({ name: 'buildingId' })
building: Building;


@OneToMany(() => ClassSchedule, cs => cs.room)
schedules: ClassSchedule[];
}