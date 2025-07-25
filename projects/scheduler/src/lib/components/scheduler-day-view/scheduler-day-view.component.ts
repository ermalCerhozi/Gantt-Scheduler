import { Component, output, signal, effect, computed } from '@angular/core';
import { SchedulerBaseViewComponent } from '../../components/scheduler-base-view/scheduler-base-view.component';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';

@Component({
    selector: 'scheduler-day-view',
    templateUrl: './scheduler-day-view.component.html',
    styles: ``,
    imports: [GanttChartComponent],
    standalone: true
})
export class SchedulerDayViewComponent extends SchedulerBaseViewComponent {
    readonly eventClicked = output<any>();

    readonly year = signal<number>(0);
    readonly month = signal<number>(0);
    readonly week = signal<number>(0);
    readonly day = signal<number>(0);
    readonly currentDate = signal<string>('');
    readonly title = signal<string>('');

    readonly hoursOfDay: string[] = [];
    readonly daysOfweek: string[];
    readonly monthsOfYear: string[];
    readonly dateSplitter: string;

    readonly tableRows = computed(() => this.tableRowSourceService.tableRows());
    readonly events = computed(() => this.tableRowSourceService.events());

    constructor() {
        super();
        this.daysOfweek = this.staticValuesService.getDaysOfWeek();
        this.monthsOfYear = this.staticValuesService.getMonthsOfYear();
        this.dateSplitter = this.staticValuesService.getDateSplitter();

        effect(() => {
            if (this.year() && this.week() !== undefined && this.day() !== undefined) {
                this.calculateCurrentDate();
            }
        });
    }

    private calculateCurrentDate() {
        const date = this.staticValuesService.getDateOfDay(this.year(), this.week(), this.day());
        const currentDate = this.staticValuesService.transformDate(
            +date.split(this.dateSplitter)[0], 
            date.split(this.dateSplitter)[1], 
            date.split(this.dateSplitter)[2]
        );
        
        this.currentDate.set(currentDate);

        const dayIndex = this.getDayIndex(this.day());
        const month = this.monthsOfYear[+date.split(this.dateSplitter)[1] - 1];
        const title = `${this.daysOfweek[dayIndex]} ${+date.split(this.dateSplitter)[2]} ${month}, ${this.year()}`;
        
        this.title.set(title);
    }

    override todayButtonHandler() {
        this.day.set(this.staticValuesService.getCurrentDay());
        this.week.set(this.staticValuesService.getCurrentWeek());
        this.month.set(this.staticValuesService.getCurrentMonth());
        this.year.set(this.staticValuesService.getCurrentYear());
    }

    override previousButtonHandler() {
        const currentDay = this.day();
        const currentWeek = this.week();
        const currentYear = this.year();
        
        if (currentDay <= 0) {
            this.day.set(6);
            if (currentWeek <= 1) {
                this.year.set(currentYear - 1);
                this.week.set(this.staticValuesService.getWeeksOfYear(currentYear - 1));
            } else {
                this.week.set(currentWeek - 1);
            }
        } else {
            this.day.set(currentDay - 1);
        }
    }

    override nextButtonHandler() {
        const currentDay = this.day();
        const currentWeek = this.week();
        const currentYear = this.year();
        
        if (currentDay >= 6) {
            this.day.set(0);
            const weeksOfYear = this.staticValuesService.getWeeksOfYear(currentYear);
            if (currentWeek >= weeksOfYear) {
                this.week.set(1);
                this.year.set(currentYear + 1);
            } else {
                this.week.set(currentWeek + 1);
            }
        } else {
            this.day.set(currentDay + 1);
        }
    }

    override setDateButtonHandler(date: Date) {
        this.year.set(date.getFullYear());
        this.month.set(date.getMonth() + 1);
        this.week.set(this.staticValuesService.getWeekOfDate(date));
        this.day.set(date.getDay());
    }

    private getDayIndex(index: number): number {
        return (index + 1) % 7;
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}