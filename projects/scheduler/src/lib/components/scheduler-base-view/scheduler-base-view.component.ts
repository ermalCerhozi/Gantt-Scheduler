import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';

import { DateChangeService } from '../../services/date-change.service';
import { StaticValuesService } from '../../services/static-values.service';
import { TableRowSourceService } from '../../services/table-row-source.service';
import { SchedulerEventHandler } from '../../core/schedulerEventHandler';

/*
  * This contains the base logic for the scheduler that will be tailored to the specific view day, week, month.
*/
@Component({
    selector: 'lib-scheduler-base-view',
    template: ``,
    styles: ``,
    imports: [],
    providers: [
        DateChangeService,
        StaticValuesService,
        TableRowSourceService
    ]
})
export class SchedulerBaseViewComponent implements OnInit, OnDestroy, SchedulerEventHandler {
    private _weekends: string[] = [];
    private _holidays: string[] = [];

    private nextSubscription: Subscription | null = null;
    private prevSubscription: Subscription | null = null;
    private todaySubscription: Subscription | null = null;
    private setDateSubscription: Subscription | null = null;
    private tableRowSubscription: Subscription | null = null;
    private eventsSubscription: Subscription | null = null;
    private holidaysSubscription: Subscription | null = null;
    private weekendsSubscription: Subscription | null = null;

    dateChangeService = inject(DateChangeService);
    staticValuesService = inject(StaticValuesService);
    tableRowSourceService = inject(TableRowSourceService);

    today = this.staticValuesService.today();

    set weekends(value: any[]) {
        this._weekends = value;
    }

    get weekends(): any[] {
        return this._weekends;
    }

    set holidays(value: any[]) {
        this._holidays = value;
    }

    get holidays(): any[] {
        return this._holidays;
    }

    ngOnInit() {
        this.todayButtonHandler();

        this.nextSubscription = this.dateChangeService.onNext().subscribe(() => {
            this.nextButtonHandler();
            this.eventChangesHandler();
        });
        this.prevSubscription = this.dateChangeService.onPrevious().subscribe(() => {
            this.previousButtonHandler();
            this.eventChangesHandler();
        });
        this.todaySubscription = this.dateChangeService.onToday().subscribe(() => {
            this.todayButtonHandler();
            this.eventChangesHandler();
        });
        this.setDateSubscription = this.dateChangeService.onDateChange().subscribe((date) => {
            this.setDateButtonHandler(date);
            this.eventChangesHandler();
        });
        this.tableRowSubscription = this.tableRowSourceService.tableRowChanges().subscribe(() => {
            this.tableRowChangesHandler();
            this.eventChangesHandler();
        });
        this.eventsSubscription = this.tableRowSourceService.eventChanges().subscribe(() => {
            this.eventChangesHandler();
        });
        this.holidaysSubscription = this.tableRowSourceService.holidayChanges().subscribe((value) => {
            this.holidays = value;
        });
        this.weekendsSubscription = this.tableRowSourceService.weekendChanges().subscribe((value) => {
            this.weekends = value;
        });
    }

    todayButtonHandler() { }
    previousButtonHandler() { }
    nextButtonHandler() { }
    setDateButtonHandler(date: Date) { }
    eventChangesHandler() { }
    tableRowChangesHandler() { }

    ngOnDestroy() {
        this.nextSubscription?.unsubscribe();
        this.prevSubscription?.unsubscribe();
        this.todaySubscription?.unsubscribe();
        this.tableRowSubscription?.unsubscribe();
        this.eventsSubscription?.unsubscribe();
        this.holidaysSubscription?.unsubscribe();
        this.weekendsSubscription?.unsubscribe();
    }
}