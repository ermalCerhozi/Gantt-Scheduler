import { Component, output, signal, effect, computed } from '@angular/core';
import { SchedulerBaseViewComponent } from '../scheduler-base-view/scheduler-base-view.component';
import { SchedulerEventHandler } from '../../core/schedulerEventHandler';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';

@Component({
    selector: 'scheduler-week-view',
    templateUrl: './scheduler-week-view.component.html',
    styleUrl: './scheduler-week-view.component.scss',
    imports: [GanttChartComponent],
    standalone: true
})
export class SchedulerWeekViewComponent extends SchedulerBaseViewComponent implements SchedulerEventHandler {
    readonly eventClicked = output<any>();

    readonly week = signal<number>(0);
    readonly year = signal<number>(0);
    readonly title = signal<string>('');
    readonly startOfWeek = signal<string>('');
    readonly endOfWeek = signal<string>('');

    readonly daysOfweek: string[];
    readonly dateSplitter: string;

    readonly tableRows = computed(() => this.tableRowSourceService.tableRows());
    readonly events = computed(() => this.tableRowSourceService.events());

    constructor() {
        super();
        this.daysOfweek = this.staticValuesService.getDaysOfWeek();
        this.dateSplitter = this.staticValuesService.getDateSplitter();

        effect(() => {
            if (this.week() && this.year()) {
                this.calculateCurrentDate();
            }
        });
    }
    
    private calculateCurrentDate() {
        const start = this.staticValuesService.getDateOfDay(this.year(), this.week(), 0);
        const end = this.staticValuesService.getDateOfDay(this.year(), this.week(), 6);
        
        const startOfWeek = this.staticValuesService.transformDate(
            +start.split(this.dateSplitter)[0], 
            start.split(this.dateSplitter)[1], 
            start.split(this.dateSplitter)[2]
        );
        const endOfWeek = this.staticValuesService.transformDate(
            +end.split(this.dateSplitter)[0], 
            end.split(this.dateSplitter)[1], 
            end.split(this.dateSplitter)[2]
        );
        
        this.startOfWeek.set(startOfWeek);
        this.endOfWeek.set(endOfWeek);
        this.title.set(`${start.split(this.dateSplitter)[2]}/${start.split(this.dateSplitter)[1]}/${start.split(this.dateSplitter)[0]} - ${end.split(this.dateSplitter)[2]}/${end.split(this.dateSplitter)[1]}/${end.split(this.dateSplitter)[0]}`);
    }

    override todayButtonHandler() {
        this.week.set(this.staticValuesService.getCurrentWeek());
        this.year.set(this.staticValuesService.getCurrentYear());
    }

    override previousButtonHandler() {
        const currentWeek = this.week();
        const currentYear = this.year();
        
        if (currentWeek <= 1) {
            this.year.set(currentYear - 1);
            this.week.set(this.staticValuesService.getWeeksOfYear(currentYear - 1) - 1);
        } else {
            this.week.set(currentWeek - 1);
        }
    }

    override nextButtonHandler() {
        const currentWeek = this.week();
        const currentYear = this.year();
        const weeksOfYear = this.staticValuesService.getWeeksOfYear(currentYear);
        
        if (currentWeek >= weeksOfYear - 1) {
            this.year.set(currentYear + 1);
            this.week.set(1);
        } else {
            this.week.set(currentWeek + 1);
        }
    }

    override setDateButtonHandler(date: Date) {
        this.week.set(this.staticValuesService.getWeekOfDate(date));
        this.year.set(date.getFullYear());
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}