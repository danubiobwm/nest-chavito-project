import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ProfessorService } from './professor.service';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';


@Controller('professors')
export class ProfessorController {
  constructor(private readonly service: ProfessorService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('hours') // GET /professors/hours
  hours() {
    return this.service.hoursPerWeek();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(parseInt(id));
  }

  @Post()
  create(@Body() dto: CreateProfessorDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProfessorDto) {
    return this.service.update(parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(parseInt(id));
  }
}
