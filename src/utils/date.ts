import { DayOfWeek } from '../types';

const DAYS: DayOfWeek[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export function getTodayDayOfWeek(): DayOfWeek {
  return DAYS[new Date().getDay()];
}
