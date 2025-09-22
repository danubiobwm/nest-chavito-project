import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Class } from './class.entity';
import { Room } from './room.entity';


@Entity()
export class ClassSchedule {
@PrimaryGeneratedColumn()
id: number;


@ManyToOne(() => Class, c => c.schedules)
class: Class;


@ManyToOne(() => Room, r => r.schedules)
room: Room;


@Column()
day_of_week: string; // e.g. 'MON', 'TUE'


@Column('time')
start_time: string;


@Column('time')
end_time: string;
}