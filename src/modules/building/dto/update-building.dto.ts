import { IsOptional, IsString } from 'class-validator';

export class UpdateBuildingDto {
  @IsOptional()
  @IsString()
  name?: string;
}
