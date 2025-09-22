import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  subject_id: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  professorId?: number;
}
