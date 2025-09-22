import { IsNumber } from 'class-validator';

export class CreatePrerequisiteDto {
  @IsNumber()
  subjectId: number;

  @IsNumber()
  prerequisiteId: number;
}
