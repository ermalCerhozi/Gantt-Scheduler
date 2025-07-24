import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';

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

    readonly weekends = signal<any[]>([]);
    readonly holidays = signal<any[]>([]);
    
    readonly today = this.staticValuesService.today();

    constructor() {
        effect(() => {
            const nextTrigger = this.dateChangeService.nextTrigger();
            if (nextTrigger > 0) {
                untracked(() => this.nextButtonHandler());
            }
        });

        effect(() => {
            const previousTrigger = this.dateChangeService.previousTrigger();
            if (previousTrigger > 0) {
                untracked(() => this.previousButtonHandler());
            }
        });

        effect(() => {
            const todayTrigger = this.dateChangeService.todayTrigger();
            if (todayTrigger > 0) {
                untracked(() => this.todayButtonHandler());
            }
        });

        effect(() => {
            const currentDate = this.dateChangeService.currentDate();
            if (currentDate) {
                untracked(() => this.setDateButtonHandler(currentDate));
            }
        });

        effect(() => {
            const downloadTrigger = this.dateChangeService.downloadTrigger();
            if (downloadTrigger > 0) {
                untracked(() => this.downloadButtonHandler());
            }
        });

        effect(() => {
            const serviceHolidays = this.tableRowSourceService.holidays();
            untracked(() => this.holidays.set(serviceHolidays));
        });

        effect(() => {
            const serviceWeekends = this.tableRowSourceService.weekends();
            untracked(() => this.weekends.set(serviceWeekends));
        });
    }

    ngOnInit() {
        this.todayButtonHandler();
    }

    todayButtonHandler() { }
    previousButtonHandler() { }
    nextButtonHandler() { }
    setDateButtonHandler(date: Date) { }
    downloadButtonHandler() { }
}