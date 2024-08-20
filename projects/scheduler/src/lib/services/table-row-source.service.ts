import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableRowSourceService {
    private events = new BehaviorSubject<any[]>([]);
    public tableRows = new BehaviorSubject<any[]>([]);
    private holidays = new BehaviorSubject<any[]>([]);
    private weekends = new BehaviorSubject<any[]>([]);

    eventSelect = new EventEmitter<any>();

    setEvents(events: any[]) {
        this.events.next(events);
        console.log('TableRowSourceService Events changed:', events);
    }

    setTableRows(tableRows: any[]) {
        this.tableRows.next(tableRows);
        console.log('TableRowSourceService TableRows changed:', tableRows);
    }

    setHolidays(holidays: any[]) {
        this.holidays.next(holidays);
        console.log('TableRowSourceService Holidays changed:', holidays);
    }

    setWeekends(weekends: any[]) {
        this.weekends.next(weekends);
        console.log('TableRowSourceService Weekends changed:', weekends);
    }

    tableRowChanges() {
        return this.tableRows.asObservable();
    }

    eventChanges() {
        return this.events.asObservable();
    }

    holidayChanges() {
        return this.holidays.asObservable();
    }

    weekendChanges() {
        return this.weekends.asObservable();
    }

    onEventSelect(e: any) {
        this.eventSelect.emit(e);
    }

    getEvents() {
        return this.events.value;
    }
    
    getTableRows() {
        return this.tableRows.value;
    }
}