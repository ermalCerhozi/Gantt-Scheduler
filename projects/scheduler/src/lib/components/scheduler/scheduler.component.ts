import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateChangeService } from '../../services/date-change.service';
import { SchedulerDayViewComponent } from '../scheduler-day-view/scheduler-day-view.component';
import { TableRowSourceService } from '../../services/table-row-source.service';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SchedulerMonthViewComponent } from '../scheduler-month-view/scheduler-month-view.component';
import { FormsModule } from '@angular/forms';
import { SchedulerWeekViewComponent } from '../scheduler-week-view-component/scheduler-week-view.component';
import { ViewButton } from '../../core/interface';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: 'scheduler',
    imports: [
        MatIconModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
        MatCardModule,
        SchedulerDayViewComponent,
        SchedulerMonthViewComponent,
        SchedulerWeekViewComponent,
        FormsModule,
        MatDatepickerModule,
        MatInputModule,
        MatNativeDateModule,
    ],
    providers: [
        DateChangeService,
        TableRowSourceService,
    ],
    templateUrl: './scheduler.component.html',
    styleUrl: './scheduler.component.scss',
    standalone: true
})
export class ResourceSchedulerComponent {
    private readonly tableRowSourceService = inject(TableRowSourceService);
    private readonly dateChangeService = inject(DateChangeService);
    private readonly dialog = inject(MatDialog);

    readonly tableRows = input.required<any[]>();
    readonly events = input.required<any[]>();
    readonly weekends = input.required<any[]>();
    readonly holidays = input.required<any[]>();
    readonly activeView = input.required<string>();

    readonly onSetDate = output<string>();
    readonly onDownload = output<void>();
    readonly onEventClick = output<any>();

    readonly goToDateValue = signal<Date | null>(null);
    readonly currentActiveView = signal<string>('');

    get goToDateValueModel(): Date | null {
        return this.goToDateValue();
    }

    set goToDateValueModel(value: Date | null) {
        this.goToDateValue.set(value);
    }

    get currentActiveViewModel(): string {
        return this.currentActiveView();
    }

    set currentActiveViewModel(value: string) {
        this.currentActiveView.set(value);
    }

    public readonly viewButtons: ViewButton[] = [
        { id: 'month', name: 'Month' },
        { id: 'week', name: 'Week' },
        { id: 'day', name: 'Day' }
    ];

    constructor() {
        effect(() => {
            const currentEvents = this.events();
            this.tableRowSourceService.setEvents(currentEvents);
        });

        effect(() => {
            const currentWeekends = this.weekends();
            this.tableRowSourceService.setWeekends(currentWeekends);
        });

        effect(() => {
            const currentHolidays = this.holidays();
            this.tableRowSourceService.setHolidays(currentHolidays);
        });

        effect(() => {
            const currentTableRows = this.tableRows();
            this.tableRowSourceService.setTableRows(currentTableRows);
        });

        effect(() => {
            const view = this.activeView();
            this.currentActiveView.set(view);
        });
    }

    viewChangeHandler(view: any) {
        this.currentActiveView.set(view);
        this.goToDateValue.set(null);
    }

    previousHandler() {
        this.dateChangeService.previous();
        this.goToDateValue.set(null);
    }

    nextHandler() {
        this.dateChangeService.next();
        this.goToDateValue.set(null);
    }

    todayHandler() {
        this.dateChangeService.today();
        this.goToDateValue.set(null);
    }

    updateEvent(event: any[]) {
        this.onEventClick.emit(event);
    }

    goToDate(date: Date) {
        this.dateChangeService.setDate(date);
        this.onSetDate.emit(this.currentActiveView());
    }

    downloadHandler() {
        this.dateChangeService.download();
        this.onDownload.emit();
    }
}