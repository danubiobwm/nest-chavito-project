import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSubjectDto {
  @IsOptional()
  @IsString()
  subject_id?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  professorId?: number | null;
}
