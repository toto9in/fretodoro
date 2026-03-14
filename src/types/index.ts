export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Block {
  id: string;
  title: string;
  duration_minutes: number;
  order_index: number;
}

export interface DayRoutine {
  day_of_week: DayOfWeek;
  blocks: Block[];
}

export interface Schedule {
  routines: DayRoutine[];
}
