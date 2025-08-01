import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

export function formatDateForInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function formatDisplayTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'h:mm a');
}

export function formatDisplayDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
}

export function formatDisplayDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, h:mm a');
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function isSameDayAsDate(dateString: string, compareDate: Date): boolean {
  return isSameDay(parseISO(dateString), compareDate);
}

export function getTimeSlots(startHour: number = 6, endHour: number = 22): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < endHour) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

export function calculateDuration(start: string, end: string): string {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${minutes}m`;
}