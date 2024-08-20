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
    daysOfWeek: any[] = this.staticValues.getDaysOfWeek();
    title: string = '';
    dateSplitter: string = this.staticValues.getDateSplitter();

    tableRows: any[] = [];
    events: any[] = [];

    startOfWeek: string = '';
    endOfWeek: string = '';
    
    calculateCurrentDate() {
        const start = this.staticValues.getDateOfDay(this.year, this.week, 0);
        const end = this.staticValues.getDateOfDay(this.year, this.week, 6);
        this.startOfWeek = this.staticValues.transformDate(+start.split(this.dateSplitter)[0], start.split(this.dateSplitter)[1], start.split(this.dateSplitter)[2]);
        this.endOfWeek = this.staticValues.transformDate(+end.split(this.dateSplitter)[0], end.split(this.dateSplitter)[1], end.split(this.dateSplitter)[2]);
        this.title = `${start.split(this.dateSplitter)[2]}/${start.split(this.dateSplitter)[1]}/${start.split(this.dateSplitter)[0]} - ${end.split(this.dateSplitter)[2]}/${end.split(this.dateSplitter)[1]}/${end.split(this.dateSplitter)[0]}`;
    }

    override todayButtonHandler() {
        this.week = this.staticValues.getCurrentWeek();
        this.year = this.staticValues.getCurrentYear();
        this.calculateCurrentDate();
    }

    override previousButtonHandler() {
        this.week--;
        if (this.week < 1) {
        this.year--;
        this.week = this.staticValues.getWeeksOfYear(this.year) - 1;
        }
        this.calculateCurrentDate();
    }

    override nextButtonHandler() {
        this.week++;
        const weeksOfYear = this.staticValues.getWeeksOfYear(this.year);
        if (this.week >= weeksOfYear) {
        this.year++;
        this.week = 1;
        }
        this.calculateCurrentDate();
    }

    override eventChangesHandler() {
        this.events = [];
        this.events = this.tableRowSourceService.getEvents();
    }

    override tableRowChangesHandler() {
        this.tableRows = this.tableRowSourceService.getTableRows();
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}