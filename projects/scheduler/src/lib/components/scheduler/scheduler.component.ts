import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { DateChangeService } from '../../services/date-change.service';
import { TableRowSourceService } from '../../services/table-row-source.service';
import { SchedulerDayViewComponent } from '../scheduler-day-view/scheduler-day-view.component';
import { SchedulerMonthViewComponent } from '../scheduler-month-view/scheduler-month-view.component';
import { SchedulerWeekViewComponent } from '../scheduler-week-view-component/scheduler-week-view.component';
import { ViewButton } from '../../core/interface';

@Component({
    selector: 'scheduler',
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatNativeDateModule,
        SchedulerDayViewComponent,
        SchedulerMonthViewComponent,
        SchedulerWeekViewComponent,
    ],
    providers: [DateChangeService, TableRowSourceService],
    templateUrl: './scheduler.component.html',
    styleUrl: './scheduler.component.scss',
    standalone: true
})
export class ResourceSchedulerComponent {
    private readonly tableRowSourceService = inject(TableRowSourceService);
    private readonly dateChangeService = inject(DateChangeService);

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

    readonly viewButtons: ViewButton[] = [
        { id: 'month', name: 'Month' },
        { id: 'week', name: 'Week' },
        { id: 'day', name: 'Day' }
    ];

    constructor() {
        effect(() => this.tableRowSourceService.setEvents(this.events()));
        effect(() => this.tableRowSourceService.setWeekends(this.weekends()));
        effect(() => this.tableRowSourceService.setHolidays(this.holidays()));
        effect(() => this.tableRowSourceService.setTableRows(this.tableRows()));
        effect(() => this.currentActiveView.set(this.activeView()));
    }

    viewChangeHandler(view: string) {
        this.currentActiveView.set(view);
    }

    previousHandler() {
        this.dateChangeService.previous();
    }

    nextHandler() {
        this.dateChangeService.next();
    }

    todayHandler() {
        this.dateChangeService.today();
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