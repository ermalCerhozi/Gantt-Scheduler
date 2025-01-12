import { Component, EventEmitter, Output } from '@angular/core';
import { SchedulerBaseViewComponent } from '../scheduler-base-view/scheduler-base-view.component';
import { SchedulerEventHandler } from '../../core/schedulerEventHandler';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';

@Component({
  selector: 'scheduler-week-view',
  templateUrl: './scheduler-week-view.component.html',
  styleUrl: './scheduler-week-view.component.scss',
  standalone: true,
  imports: [GanttChartComponent],
})
export class SchedulerWeekViewComponent extends SchedulerBaseViewComponent implements SchedulerEventHandler {
    @Output('eventClicked') eventClicked = new EventEmitter<any>();

    week: number = 0;
    year: number = 0;
    daysOfweek: string[] = [];
    title: string = '';
    dateSplitter: string = '';

    tableRows: any[] = [];
    events: any[] = [];

    startOfWeek: string = '';
    endOfWeek: string = '';

    constructor() {
        super();
        this.daysOfweek = this.staticValuesService.getDaysOfWeek();
        this.dateSplitter = this.staticValuesService.getDateSplitter();
    }
    
    calculateCurrentDate() {
        const start = this.staticValuesService.getDateOfDay(this.year, this.week, 0);
        const end = this.staticValuesService.getDateOfDay(this.year, this.week, 6);
        this.startOfWeek = this.staticValuesService.transformDate(+start.split(this.dateSplitter)[0], start.split(this.dateSplitter)[1], start.split(this.dateSplitter)[2]);
        this.endOfWeek = this.staticValuesService.transformDate(+end.split(this.dateSplitter)[0], end.split(this.dateSplitter)[1], end.split(this.dateSplitter)[2]);
        this.title = `${start.split(this.dateSplitter)[2]}/${start.split(this.dateSplitter)[1]}/${start.split(this.dateSplitter)[0]} - ${end.split(this.dateSplitter)[2]}/${end.split(this.dateSplitter)[1]}/${end.split(this.dateSplitter)[0]}`;
    }

    override todayButtonHandler() {
        this.week = this.staticValuesService.getCurrentWeek();
        this.year = this.staticValuesService.getCurrentYear();
        this.calculateCurrentDate();
    }

    override previousButtonHandler() {
        this.week--;
        if (this.week < 1) {
        this.year--;
        this.week = this.staticValuesService.getWeeksOfYear(this.year) - 1;
        }
        this.calculateCurrentDate();
    }

    override nextButtonHandler() {
        this.week++;
        const weeksOfYear = this.staticValuesService.getWeeksOfYear(this.year);
        if (this.week >= weeksOfYear) {
        this.year++;
        this.week = 1;
        }
        this.calculateCurrentDate();
    }

    override setDateButtonHandler(date: Date) {
        this.week = this.staticValuesService.getWeekOfDate(date);
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
        this.tableRows = this.tableRowSourceService.getTableRows();
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}