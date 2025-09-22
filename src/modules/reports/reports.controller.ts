import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { HoursPerProfessorDto } from './dto/hours-per-professor.dto';
import { RoomsScheduleDto } from './dto/rooms-schedule.dto';


@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('hours-per-professor')
  async hoursPerProfessor(): Promise<HoursPerProfessorDto[]> {
    return this.service.hoursPerProfessor();
  }

  @Get('rooms-schedule')
  async roomsSchedule(): Promise<RoomsScheduleDto[]> {
    return this.service.roomsSchedule();
  }
}
