import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateProfessorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @IsOptional()
  @IsNumber()
  titleId?: number;

  @IsOptional()
  @IsBoolean()
  isDirector?: boolean;
}
