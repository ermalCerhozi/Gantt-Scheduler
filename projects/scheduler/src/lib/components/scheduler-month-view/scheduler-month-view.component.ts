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
    monthsOfYear: string[] = this.staticValues.getMonthsOfYear();
    title: string = '';

    tableRows: any[] = [];
    events: any[] = [];

    daysOfMonth: number = 0;

    calculateCurrentDate() {
        this.daysOfMonth = this.staticValues.getDaysOfMonth(this.year, this.month);
        const month = this.monthsOfYear[this.month - 1];
        this.title = month + ' ' + this.year;
    }

    override todayButtonHandler() {
        this.month = this.staticValues.getCurrentMonth();
        this.year = this.staticValues.getCurrentYear();
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

    override eventChangesHandler() {
        this.events = [];
        this.events = this.tableRowSourceService.getEvents();
    }

    override tableRowChangesHandler() {
        this.tableRows = [];
        this.tableRows = this.tableRowSourceService.getTableRows();
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}
