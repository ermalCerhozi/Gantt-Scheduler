import { Component, output, signal, effect, computed, viewChild, untracked } from '@angular/core';
import { SchedulerBaseViewComponent } from '../scheduler-base-view/scheduler-base-view.component';
import { SchedulerEventHandler } from '../../core/schedulerEventHandler';
import { GanttChartComponent } from '../gantt-chart/gantt-chart.component';

@Component({
    selector: 'scheduler-month-view',
    templateUrl: './scheduler-month-view.component.html',
    styleUrl: './scheduler-month-view.component.css',
    imports: [GanttChartComponent],
    standalone: true
})
export class SchedulerMonthViewComponent extends SchedulerBaseViewComponent implements SchedulerEventHandler {
    readonly eventClicked = output<any>();
    readonly ganttChart = viewChild<GanttChartComponent>('ganttChart');

    readonly month = signal<number>(0);
    readonly year = signal<number>(0);
    readonly title = signal<string>('');
    readonly daysOfMonth = signal<number>(0);

    readonly monthsOfYear: string[];

    readonly tableRows = computed(() => this.tableRowSourceService.tableRows());
    readonly events = computed(() => this.tableRowSourceService.events());

    constructor() {
        super();
        this.monthsOfYear = this.staticValuesService.getMonthsOfYear();

        effect(() => {
            if (this.month() && this.year()) {
                untracked(() => this.calculateCurrentDate());
            }
        });
    }

    private calculateCurrentDate() {
        const currentMonth = this.month();
        const currentYear = this.year();
        
        this.daysOfMonth.set(this.staticValuesService.getDaysOfMonth(currentYear, currentMonth));
        const monthName = this.monthsOfYear[currentMonth - 1];
        this.title.set(`${monthName} ${currentYear}`);
    }

    override todayButtonHandler() {
        this.month.set(this.staticValuesService.getCurrentMonth());
        this.year.set(this.staticValuesService.getCurrentYear());
    }

    override previousButtonHandler() {
        const currentMonth = this.month();
        const currentYear = this.year();
        
        if (currentMonth <= 1) {
            this.month.set(12);
            this.year.set(currentYear - 1);
        } else {
            this.month.set(currentMonth - 1);
        }
    }

    override nextButtonHandler() {
        const currentMonth = this.month();
        const currentYear = this.year();
        
        if (currentMonth >= 12) {
            this.month.set(1);
            this.year.set(currentYear + 1);
        } else {
            this.month.set(currentMonth + 1);
        }
    }

    override setDateButtonHandler(date: Date) {
        this.month.set(date.getMonth() + 1);
        this.year.set(date.getFullYear());
    }

    override downloadButtonHandler() {
        const chart = this.ganttChart();
        if (chart) {
            chart.generatePDF();
        }
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}