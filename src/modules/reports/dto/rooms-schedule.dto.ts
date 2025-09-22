export class RoomsScheduleDto {
  room_id: number;
  room_name: string;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  class_id: number | null;
}
