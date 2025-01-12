import { Component, EventEmitter, Output } from '@angular/core';
import { SchedulerBaseViewComponent } from '../scheduler-base-view/scheduler-base-view.component';
import { SchedulerEventHandler } from '../../core/schedulerEventHandler';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';

@Component({
  selector: 'scheduler-month-view',
  templateUrl: './scheduler-month-view.component.html',
  styleUrl: './scheduler-month-view.component.css',
  standalone: true,
  imports: [GanttChartComponent],
})
export class SchedulerMonthViewComponent extends SchedulerBaseViewComponent implements SchedulerEventHandler {
    @Output('eventClicked') eventClicked = new EventEmitter<any>();

    month: number = 0;
    year: number = 0;
    monthsOfYear: string[] = [];
    title: string = '';

    tableRows: any[] = [];
    events: any[] = [];

    daysOfMonth: number = 0;

    constructor() {
        super();
        this.monthsOfYear = this.staticValuesService.getMonthsOfYear();
    }

    calculateCurrentDate() {
        this.daysOfMonth = this.staticValuesService.getDaysOfMonth(this.year, this.month);
        const month = this.monthsOfYear[this.month - 1];
        this.title = month + ' ' + this.year;
    }

    override todayButtonHandler() {
        this.month = this.staticValuesService.getCurrentMonth();
        this.year = this.staticValuesService.getCurrentYear();
        this.calculateCurrentDate();
    }

    override previousButtonHandler() {
        this.month--;
        if (this.month < 1) {
            this.month = 12;
            this.year--;
        }
        this.calculateCurrentDate();
    }

    override nextButtonHandler() {
        this.month++;
        if (this.month > 12) {
            this.month = 1;
            this.year++;
        }
        this.calculateCurrentDate();
    }

    override setDateButtonHandler(date: Date) {
        this.month = date.getMonth() + 1;
        this.year = date.getFullYear();
        this.calculateCurrentDate();
    }

    override eventChangesHandler() {
        this.events = [];
        this.tableRowSourceService.eventChanges().subscribe((events) => {
            this.events = events;
        });
    }

    override tableRowChangesHandler() {
        this.tableRows = [];
        this.tableRows = this.tableRowSourceService.getTableRows();
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}
