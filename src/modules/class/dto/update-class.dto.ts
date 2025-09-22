import { IsOptional, IsNumber, IsString } from 'class-validator';

export class UpdateClassDto {
  @IsOptional()
  @IsNumber()
  subjectId?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsString()
  code?: string;
}
