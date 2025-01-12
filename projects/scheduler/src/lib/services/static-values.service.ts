import { Injectable } from '@angular/core';
import { format, getDaysInMonth, getWeek, addDays, addHours, addMinutes, getMonth, getYear, getDay, parseISO, endOfMonth } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class StaticValuesService {
    constructor() { }
    startDayOfweek: number = 0;

    getHoursOfDay(): string[] {
        const hours = [
        '00:00',
        '01:00',
        '02:00',
        '03:00',
        '04:00',
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
        ];
        return hours;
    }

    getDaysOfWeek(): string[] {
        const days = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        ];
        return days;
    }

    getDateSplitter(): string{
        return  "-" // '/' | '-' | '.'
    }
        
    getMonthsOfYear(): string[] {
        const months: string[] = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        return months;
    }

    getWeeksOfMonth(year: number, month: number): string[] {
        const startDate = new Date(year, month - 1, 1);
        const endDate = endOfMonth(startDate);
        const firstWeekOfMonth = getWeek(startDate);
        let lastWeekOfMonth = getWeek(endDate);

        let weeks: string[] = [];
        
        if(month === 12 && lastWeekOfMonth === 1) {
            const d = firstWeekOfMonth + (getDaysInMonth(startDate) + getDay(startDate)) / 7;
            lastWeekOfMonth = Math.floor(d);
        }

        for(let i = firstWeekOfMonth; i <= lastWeekOfMonth; i++) {
            weeks.push(i.toString());
        }

        return weeks;
    }

    getDateOfDay(year: number, weekOfYear: number, dayOfWeek: number, dateSplitter: string = '-'): string {
        const firstDayOfYear = getDay(new Date(year, 0, 1));
        const dateOfDay = format(addDays(new Date(year, 0, 1), ((weekOfYear - 1) * 7) - firstDayOfYear + dayOfWeek), `yyyy${dateSplitter}MM${dateSplitter}dd`);
        return dateOfDay;
    }

    getDaysOfMonth(year: number, monthId: number): number {
        return getDaysInMonth(new Date(year, monthId - 1, 1));
    }

    transformDate(year: number, month: string, day: string, hour: string = '00', minute: string = '00'): string {
        const monthPadded = month.padStart(2, '0');
        const dayPadded = day.padStart(2, '0');
        const dateString = `${year}-${monthPadded}-${dayPadded}T${hour}:${minute}:00`;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new RangeError('Invalid time value');
        }
        return format(date, 'yyyy-MM-dd\'T\'HH:mm:ss');
    }

    getCurrentMonth(): number {
        return getMonth(new Date()) + 1;
    }

    getCurrentYear(): number {
        return getYear(new Date());
    }

    getCurrentWeek(): number {
        return getWeek(new Date());
    }

    getWeeksOfYear(year: number): number {
        const startDate = new Date(year, 11, 1);
        const endDate = endOfMonth(startDate);
        const firstWeekOfMonth = getWeek(startDate);
        const d = firstWeekOfMonth + (getDaysInMonth(startDate) + getDay(startDate)) / 7;

        return Math.floor(d);
    }

    getCurrentDay(): number {
        return getDay(new Date());
    }

    today(): string {
        return format(new Date(), 'yyyy-MM-dd');
    }

    addTime(date: string, hours: number, minutes: number): string {
        return format(addMinutes(addHours(parseISO(date), hours), minutes), 'yyyy-MM-dd');
    }

    getInitialView(): string {
        return 'day'; //'month' | 'week' | 'day';
    }

    getWeekOfDate(date: Date): number {
        return getWeek(date);
    }
}