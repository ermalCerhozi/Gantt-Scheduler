import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableRowSourceService {
    readonly events = signal<any[]>([]);
    readonly tableRows = signal<any[]>([]);
    readonly holidays = signal<any[]>([]);
    readonly weekends = signal<any[]>([]);
    
    readonly selectedEvent = signal<any>(null);

    setEvents(events: any[]) {
        this.events.set(events);
    }

    setTableRows(tableRows: any[]) {
        this.tableRows.set(tableRows);
    }

    setHolidays(holidays: any[]) {
        this.holidays.set(holidays);
    }

    setWeekends(weekends: any[]) {
        this.weekends.set(weekends);
    }

    onEventSelect(e: any) {
        this.selectedEvent.set(e);
    }
}