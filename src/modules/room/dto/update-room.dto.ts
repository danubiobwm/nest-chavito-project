import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  buildingId?: number;
}
