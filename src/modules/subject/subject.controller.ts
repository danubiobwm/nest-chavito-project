import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';


@Controller('subjects')
export class SubjectController {
  constructor(private readonly service: SubjectService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(parseInt(id));
  }

  @Post()
  create(@Body() dto: CreateSubjectDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.service.update(parseInt(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(parseInt(id));
  }

  @Post(':id/prerequisites')
  addPrerequisite(@Param('id') id: string, @Body() body: { prerequisiteId: number }) {
    const dto: CreatePrerequisiteDto = { subjectId: parseInt(id), prerequisiteId: body.prerequisiteId };
    return this.service.addPrerequisite(dto);
  }

  @Delete('prerequisites/:prereqId')
  removePrerequisite(@Param('prereqId') prereqId: string) {
    return this.service.removePrerequisite(parseInt(prereqId));
  }
}
