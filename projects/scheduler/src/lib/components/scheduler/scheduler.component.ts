import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
    standalone: true,
    imports: [
        MatIconModule,
        SchedulerDayViewComponent,
        SchedulerDayViewComponent,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
        MatCardModule,
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
})

export class ResourceSchedulerComponent implements OnInit, OnChanges {
    tableRowSourceService = inject(TableRowSourceService);
    dateChangeService = inject(DateChangeService);
    dialog = inject(MatDialog);

    @Input('TableRows') tableRows!: any[];
    @Input('Events') events!: any[];
    @Input('Weekends') weekends!: any[];
    @Input('Holidays') holidays!: any[];
    @Input('ActiveView') activeView!: string;

    @Output('ViewChange') onViewChange = new EventEmitter<string>();
    @Output('Previous') onPrevious = new EventEmitter<void>();
    @Output('Today') onToday = new EventEmitter<void>();
    @Output('Next') onNext = new EventEmitter<void>();
    @Output('SetDate') onSetDate = new EventEmitter<string>();
    @Output('EventClick') onEventClick = new EventEmitter<any>();

    public viewButtons: ViewButton[] = [
        { id: 'month', name: 'Month' },
        { id: 'week', name: 'Week' },
        { id: 'day', name: 'Day' }
    ];

    goToDateValue: Date | null = null;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['events'] && !changes['events'].isFirstChange()) {
            if (changes['events'].previousValue !== changes['events'].currentValue) {
                this.tableRowSourceService.setEvents(this.events);
            }
        }
        if (changes['weekends'] && !changes['weekends'].isFirstChange()) {
            if (changes['weekends'].previousValue !== changes['weekends'].currentValue) {
                this.tableRowSourceService.setWeekends(this.weekends);
            }
        }
        if (changes['holidays'] && !changes['holidays'].isFirstChange()) {
            if (changes['holidays'].previousValue !== changes['holidays'].currentValue) {
                this.tableRowSourceService.setHolidays(this.holidays);
            }
        }
        if (changes['tableRows'] && !changes['tableRows'].isFirstChange()) {
            if (changes['tableRows'].previousValue !== changes['tableRows'].currentValue) {
                this.tableRowSourceService.setTableRows(this.tableRows);
            }
        }
    }

    ngOnInit() {
        this.tableRowSourceService.setEvents(this.events);
        this.tableRowSourceService.setWeekends(this.weekends);
        this.tableRowSourceService.setHolidays(this.holidays);
        this.tableRowSourceService.setTableRows(this.tableRows);
    }

    viewChangeHandler(view: any) {
        this.activeView = view;
        this.onViewChange.emit(view);
        this.goToDateValue = null; // Clear the form field
    }

    previousHandler() {
        this.dateChangeService.previous();
        this.onPrevious.emit();
        this.goToDateValue = null; // Clear the form field
    }

    nextHandler() {
        this.dateChangeService.next();
        this.onNext.emit();
        this.goToDateValue = null; // Clear the form field
    }

    todayHandler() {
        this.dateChangeService.today();
        this.onToday.emit();
        this.goToDateValue = null; // Clear the form field
    }

    updateEvent(event: any[]) {
        this.onEventClick.emit(event);
    }

    goToDate(date: Date) {
        this.dateChangeService.setDate(date);
        this.onSetDate.emit(this.activeView);
    }
}
