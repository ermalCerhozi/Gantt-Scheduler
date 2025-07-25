import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ResourceSchedulerComponent } from '../../projects/scheduler/src/lib/components/scheduler/scheduler.component';
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
        { id: 4, title: 'Diana mire' }
    ];

    public events: any[] = [
        {
            rowId: 1,
            events: [
                {
                    id: 18,
                    title: "Release Candidate",
                    rowId: 1,
                    startDate: "19-07-2025",
                    endDate: "24-07-2025",
                    startTime: '12:00:00',
                    endTime: '22:00:00',
                    color: '#4FC3F7',
                },
                {
                    id: 22,
                    title: "Next Phase Planning",
                    rowId: 1,
                    startDate: "21-07-2025",
                    endDate: "27-07-2025",
                    startTime: '08:00:00',
                    endTime: '18:00:00',
                    color: '#4FC3F7',
                },
            ]
        },
        {
            rowId: 2,
            events: [
                {
                    id: 11,
                    title: "Sketch",
                    rowId: 2,
                    startDate: "17-07-2025",
                    endDate: "18-07-2025",
                    startTime: '03:00:00',
                    endTime: '22:00:00',
                    color: '#81C784',
                },
                {
                    id: 20,
                    title: "Documentation Update",
                    rowId: 2,
                    startDate: "23-07-2025",
                    endDate: "30-07-2025",
                    startTime: '10:00:00',
                    endTime: '20:00:00',
                    color: '#64B5F6',
                },
            ]
        },
        {
            rowId: 3,
            events: [
                {
                    id: 8,
                    title: "Write The JS",
                    rowId: 3,
                    startDate: "18-07-2025",
                    endDate: "23-07-2025",
                    startTime: '14:00:00',
                    endTime: '00:00:00',
                    color: '#81C784',
                },
                {
                    id: 9,
                    title: "Write The JS",
                    rowId: 3,
                    startDate: "19-07-2025",
                    endDate: "25-07-2025",
                    startTime: '15:00:00',
                    endTime: '01:00:00',
                    color: '#4FC3F7',
                },
                {
                    id: 21,
                    title: "Team Retrospective",
                    rowId: 3,
                    startDate: "18-07-2025",
                    endDate: "24-07-2025",
                    startTime: '11:00:00',
                    endTime: '21:00:00',
                    color: '#4DB6AC',
                },
            ]
        },
        {
            rowId: 4,
            events: [
                {
                    id: 7,
                    title: "Client Meeting",
                    rowId: 4,
                    startDate: "20-07-2025",
                    endDate: "24-07-2025",
                    startTime: '13:00:00',
                    endTime: '23:00:00',
                    color: '#64B5F6',
                },
                {
                    id: 19,
                    title: "Post-Release Monitoring",
                    rowId: 4,
                    startDate: "22-07-2025",
                    endDate: "28-07-2025",
                    startTime: '09:00:00',
                    endTime: '19:00:00',
                    color: '#81C784',
                },
                {
                    id: 19,
                    title: "Post-Release Monitoring",
                    rowId: 4,
                    startDate: "24-07-2025",
                    endDate: "24-07-2025",
                    startTime: '09:00:00',
                    endTime: '19:00:00',
                    color: '#81C784',
                },
            ]
        }
    ];

    public holidays: string[] = [];

    public weekEnds: number[] = [0, 6];

    save(data: any): void {
        console.log('AppComponent save data', data);
    }

    getEventsOfDate(date: Event): void {
        console.log('AppComponent Get Events of Date', date);
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
