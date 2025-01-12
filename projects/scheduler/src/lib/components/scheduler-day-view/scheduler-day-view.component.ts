import { Component, EventEmitter, Output } from '@angular/core';
import { SchedulerBaseViewComponent } from '../../components/scheduler-base-view/scheduler-base-view.component';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';

@Component({
  selector: 'scheduler-day-view',
  templateUrl: './scheduler-day-view.component.html',
  styles: ``,
  standalone: true,
  imports: [GanttChartComponent],
})
export class SchedulerDayViewComponent extends SchedulerBaseViewComponent {
    @Output('eventClicked') eventClicked = new EventEmitter<any>();

    year: number = 0;
    month: number = 0;
    week: number = 0;
    day: number = 0;
    currentDate: string = '';
    title: string = '';

    hoursOfDay: string[] = [];
    daysOfweek: string[] = [];
    monthsOfYear: string[] = [];
    dateSplitter: string = '';

    tableRows: any[] = [];
    events: any[] = [];

    constructor() {
        super();
        this.daysOfweek = this.staticValuesService.getDaysOfWeek();
        this.monthsOfYear = this.staticValuesService.getMonthsOfYear();
        this.dateSplitter = this.staticValuesService.getDateSplitter();
    }

    calculateCurrentDate() {
        let date = this.staticValuesService.getDateOfDay(this.year, this.week, this.day);
        this.currentDate = this.staticValuesService.transformDate(+date.split(this.dateSplitter)[0], date.split(this.dateSplitter)[1], date.split(this.dateSplitter)[2])

        const dayIndex = this.getDayIndex(this.day);
        const month = this.monthsOfYear[+date.split(this.dateSplitter)[1] - 1];
        this.title = `${this.daysOfweek[dayIndex]} ${+date.split(this.dateSplitter)[2]} ${month} ${"Year"} ${this.year}`;
    }

    override todayButtonHandler() {
        this.day = this.staticValuesService.getCurrentDay();
        this.week = this.staticValuesService.getCurrentWeek();
        this.month = this.staticValuesService.getCurrentMonth();
        this.year = this.staticValuesService.getCurrentYear();
        this.calculateCurrentDate();
    }

    override previousButtonHandler() {
        this.day--;
        if (this.day < 0) {
        this.day = 6;
        this.week--;
        if (this.week < 1) {
            this.year--;
            this.week = this.staticValuesService.getWeeksOfYear(this.year);
        }
        }
        this.calculateCurrentDate();
    }

    override nextButtonHandler() {
        this.day++;
        if (this.day > 6) {
        this.day = 0;
        this.week++;
        const weeksOfYear = this.staticValuesService.getWeeksOfYear(this.year);
        if (this.week > weeksOfYear) {
            this.week = 1;
            this.year++;
        }
        }
        this.calculateCurrentDate();
    }

    override setDateButtonHandler(date: Date) {
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;
        this.week = this.staticValuesService.getWeekOfDate(date);
        this.day = date.getDay();
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

    getDayIndex(index: number): number {
        return (index + 1) % 7;
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}
