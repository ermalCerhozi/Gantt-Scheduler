import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ResourceSchedulerComponent } from 'scheduler';
import { EventCreateComponent } from './event-create/event-create.component';
import { EventUpdateComponent } from './event-update/event-update.component';
import { MatDialog } from '@angular/material/dialog';
import { TableRow } from './interfaces/tableRow';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [MatIconModule, ResourceSchedulerComponent, MatButtonModule]
})
export class AppComponent {
    dialog = inject(MatDialog);

    public tableRows: TableRow[] = [
        { id: 1, title: 'Alice' },
        { id: 2, title: 'Bob' },
        { id: 3, title: 'Charlie' },
        { id: 4, title: 'Diana' }
    ];

    public events: any[] = [
        {
            id: 7,
            title: "Client Meeting",
            rowId: 4,
            startDate: "10-01-2025",
            endDate: "25-01-2025",
            startTime: '13:00:00',
            endTime: '23:00:00',
            color: '#64B5F6',
        },
        {
            id: 8,
            title: "Write The JS",
            rowId: 3,
            startDate: "05-01-2025",
            endDate: "15-01-2025",
            startTime: '14:00:00',
            endTime: '00:00:00',
            color: '#81C784',
        },
        {
            id: 9,
            title: "Write The JS",
            rowId: 3,
            startDate: "12-01-2025",
            endDate: "22-01-2025",
            startTime: '15:00:00',
            endTime: '01:00:00',
            color: '#4FC3F7',
        },
        {
            id: 11,
            title: "Sketch",
            rowId: 2,
            startDate: "01-01-2025",
            endDate: "05-01-2025",
            startTime: '03:00:00',
            endTime: '22:00:00',
            color: '#81C784',
        },
        {
            id: 18,
            title: "Release Candidate",
            rowId: 1,
            startDate: "05-01-2025",
            endDate: "20-01-2025",
            startTime: '12:00:00',
            endTime: '22:00:00',
            color: '#4FC3F7',
        },
        {
            id: 19,
            title: "Post-Release Monitoring",
            rowId: 4,
            startDate: "15-01-2025",
            endDate: "30-01-2025",
            startTime: '09:00:00',
            endTime: '19:00:00',
            color: '#81C784',
        },
        {
            id: 20,
            title: "Documentation Update",
            rowId: 2,
            startDate: "25-01-2025",
            endDate: "28-02-2025",
            startTime: '10:00:00',
            endTime: '20:00:00',
            color: '#64B5F6',
        },
        {
            id: 21,
            title: "Team Retrospective",
            rowId: 3,
            startDate: "05-01-2025",
            endDate: "20-01-2025",
            startTime: '11:00:00',
            endTime: '21:00:00',
            color: '#4DB6AC',
        },
        {
            id: 22,
            title: "Next Phase Planning",
            rowId: 1,
            startDate: "15-01-2025",
            endDate: "30-01-2025",
            startTime: '08:00:00',
            endTime: '18:00:00',
            color: '#4FC3F7',
        },
    ]

    public holidays: string[] = [];

    public weekEnds: number[] = [0, 6];

    onViewChange(view: string): void {
        console.log('AppComponent View Changed', view);
    }

    onPrevius(): void {
        console.log('AppComponent Previous called');
    }

    onToday(): void {
        console.log('AppComponent Today called');
    }

    onNext(): void {
        console.log('AppComponent Next called');
    }

    onSetDate(date: string): void {
        console.log('AppComponent Set Date', date);
    }

    onEventClick(event: any): void {
        const dialogRef = this.dialog.open(EventUpdateComponent, {
            data: {
                event: event,
                rows: this.tableRows
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const index = this.events.findIndex(event => event.id === result.id);
                if (index !== -1) {
                    this.events[index] = result;
                    this.events = [...this.events];
                }
            }
        });
    }

    createEvent(): void {
        const dialogRef = this.dialog.open(EventCreateComponent, {
            data: { rows: this.tableRows }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.events = [...this.events, result];
            }
        });
    }
}
