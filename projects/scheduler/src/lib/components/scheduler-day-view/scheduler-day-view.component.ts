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

    readonly selectedDate = signal<Date>(new Date());
    readonly title = signal<string>('');

    readonly daysOfweek: string[];
    readonly monthsOfYear: string[];
    readonly dateSplitter: string;

    readonly tableRows = computed(() => this.tableRowSourceService.tableRows());
    readonly events = computed(() => this.tableRowSourceService.events());

    readonly year = computed(() => this.selectedDate().getFullYear());
    readonly month = computed(() => this.selectedDate().getMonth() + 1);
    readonly dayOfMonth = computed(() => this.selectedDate().getDate());

    constructor() {
        super();
        this.daysOfweek = this.staticValuesService.getDaysOfWeek();
        this.monthsOfYear = this.staticValuesService.getMonthsOfYear();
        this.dateSplitter = this.staticValuesService.getDateSplitter();

        this.selectedDate.set(new Date());

        effect(() => {
            this.updateTitle();
        });
    }

    private updateTitle() {
        const date = this.selectedDate();
        const dayOfWeek = this.daysOfweek[date.getDay()];
        const month = this.monthsOfYear[date.getMonth()];
        const dayOfMonth = date.getDate();
        const year = date.getFullYear();
        
        const title = `${dayOfWeek} ${dayOfMonth} ${month}, ${year}`;
        this.title.set(title);
    }

    override todayButtonHandler() {
        this.selectedDate.set(new Date());
    }

    override previousButtonHandler() {
        const currentDate = new Date(this.selectedDate());
        currentDate.setDate(currentDate.getDate() - 1);
        this.selectedDate.set(currentDate);
    }

    override nextButtonHandler() {
        const currentDate = new Date(this.selectedDate());
        currentDate.setDate(currentDate.getDate() + 1);
        this.selectedDate.set(currentDate);
    }

    override setDateButtonHandler(date: Date) {
        this.selectedDate.set(new Date(date));
    }

    updateEvent(event: any): void {
        this.eventClicked.emit(event);
    }
}