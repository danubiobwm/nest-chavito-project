import { Controller, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';


@Controller('reports')
export class ReportsController {
constructor(private readonly service: ReportsService) {}


@Get('hours-per-professor')
hoursPerProfessor() {
return this.service.hoursPerProfessor();
}


@Get('rooms-schedule')
roomsSchedule() {
return this.service.roomsSchedule();
}
}