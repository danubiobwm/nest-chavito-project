import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateClassDto {
  @IsNumber()
  subjectId: number;

  @IsNumber()
  year: number;

  @IsString()
  @IsNotEmpty()
  semester: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
