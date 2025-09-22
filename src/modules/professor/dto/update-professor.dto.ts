import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateProfessorDto {
  @IsOptional()
  @IsString()
  name?: string;

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
