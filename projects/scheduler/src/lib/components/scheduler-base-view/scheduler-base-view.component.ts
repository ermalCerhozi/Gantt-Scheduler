import { Component, OnInit, inject, signal, effect, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DateChangeService } from '../../services/date-change.service';
import { StaticValuesService } from '../../services/static-values.service';
import { TableRowSourceService } from '../../services/table-row-source.service';
import { SchedulerEventHandler } from '../../core/schedulerEventHandler';

@Component({
    selector: 'lib-scheduler-base-view',
    template: ``,
    styles: ``,
    standalone: true,
    imports: [],
    providers: [
        DateChangeService,
        StaticValuesService,
        TableRowSourceService
    ]
})
export class SchedulerBaseViewComponent implements OnInit, SchedulerEventHandler {

    public dateChangeService = inject(DateChangeService);
    public staticValuesService = inject(StaticValuesService);
    public tableRowSourceService = inject(TableRowSourceService);
    public destroyRef = inject(DestroyRef);

    public _weekends = signal<any[]>([]);
    public _holidays = signal<any[]>([]);
    
    readonly today = this.staticValuesService.today();

    get weekends(): any[] {
        return this._weekends();
    }

    set weekends(value: any[]) {
        this._weekends.set(value);
    }

    get holidays(): any[] {
        return this._holidays();
    }

    set holidays(value: any[]) {
        this._holidays.set(value);
    }

    constructor() {
        effect(() => {
            const nextTrigger = this.dateChangeService.nextTrigger();
            if (nextTrigger > 0) {
                this.nextButtonHandler();
                this.eventChangesHandler();
            }
        });

        effect(() => {
            const previousTrigger = this.dateChangeService.previousTrigger();
            if (previousTrigger > 0) {
                this.previousButtonHandler();
                this.eventChangesHandler();
            }
        });

        effect(() => {
            const todayTrigger = this.dateChangeService.todayTrigger();
            if (todayTrigger > 0) {
                this.todayButtonHandler();
                this.eventChangesHandler();
            }
        });

        effect(() => {
            const currentDate = this.dateChangeService.currentDate();
            if (currentDate) {
                this.setDateButtonHandler(currentDate);
                this.eventChangesHandler();
            }
        });

        effect(() => {
            const downloadTrigger = this.dateChangeService.downloadTrigger();
            if (downloadTrigger > 0) {
                this.downloadButtonHandler();
            }
        });
    }

    ngOnInit() {
        this.todayButtonHandler();

        this.tableRowSourceService.tableRowChanges()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.tableRowChangesHandler();
                this.eventChangesHandler();
            });

        this.tableRowSourceService.eventChanges()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.eventChangesHandler();
            });

        this.tableRowSourceService.holidayChanges()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.holidays = value;
            });

        this.tableRowSourceService.weekendChanges()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => {
                this.weekends = value;
            });
    }

    todayButtonHandler() { }
    previousButtonHandler() { }
    nextButtonHandler() { }
    setDateButtonHandler(date: Date) { }
    downloadButtonHandler() { }
    eventChangesHandler() { }
    tableRowChangesHandler() { }
}