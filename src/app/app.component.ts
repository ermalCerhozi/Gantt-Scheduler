import { Component, inject } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { RouterOutlet } from '@angular/router';
import { ResourceSchedulerComponent } from 'scheduler';
import { EventCreateComponent } from './event-create/event-create.component';
import { EventUpdateComponent } from './event-update/event-update.component';
import { MatDialog } from '@angular/material/dialog';
import { TableRow } from './interfaces/tableRow';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, ResourceSchedulerComponent, MatButtonModule],
})
export class AppComponent {
    dialog = inject(MatDialog);

    public tableRows: TableRow[] = [
        { id: 1, title: 'Room 1' },
        { id: 2, title: 'Room 2' },
        { id: 3, title: 'Room 3' },
        { id: 4, title: 'Room 4' }
    ];

    public events: any[] = [
        {
            id: 1,
            title: "Sketch",
            done: "42",
            rowId: 1,
            startDate: "08-12-2024",
            endDate: "13-12-2024",
            startTime: '12:00:00',
            endTime: '06:15:00',
            details: "this is a test",
            color: '#A5D6A7',
        },
        {
            id: 2,
            title: "Color Profiles",
            done: "85",
            rowId: 1,
            startDate: "13-12-2024",
            endDate: "15-12-2024",
            startTime: '09:00:00',
            endTime: '17:00:00',
            details: "this is a test",
            color: '#FF8A65',
        },
        {
            id: 3,
            title: "Sketch",
            done: "67",
            rowId: 1,
            startDate: "06-12-2024",
            endDate: "09-12-2024",
            startTime: '10:00:00',
            endTime: '18:00:00',
            details: "this is a test",
            color: '#A5D6A7',
        },
        {
            id: 4,
            title: "Sketch",
            done: "23",
            rowId: 1,
            startDate: "24-10-2024",
            endDate: "31-10-2024",
            startTime: '08:00:00',
            endTime: '16:00:00',
            details: "this is a test",
            color: '#FF8A65',
        },
        {
            id: 5,
            title: "Sketch",
            done: "58",
            rowId: 4,
            startDate: "12-10-2024",
            endDate: "25-11-2024",
            startTime: '07:00:00',
            endTime: '15:00:00',
            details: "this is a test",
            color: '#FF8A65',
        },
        {
            id: 6,
            title: "Full Month Event",
            done: "91",
            rowId: 4,
            startDate: "01-08-2024",
            endDate: "05-08-2024",
            startTime: '31:00:00',
            endTime: '19:00:00',
            details: "this is a test",
            color: '#A5D6A7',
        },
        {
            id: 7,
            title: "Sketch",
            done: "76",
            rowId: 4,
            startDate: "06-08-2024",
            endDate: "29-08-2024",
            startTime: '13:00:00',
            endTime: '21:00:00',
            details: "this is a test",
            color: '#FF8A65',
        },
        {
            id: 8,
            title: "Sketch",
            done: "34",
            rowId: 3,
            startDate: "02-08-2024",
            endDate: "06-08-2024",
            startTime: '14:00:00',
            endTime: '22:00:00',
            details: "this is a test",
            color: '#FF8A65',
        },
        {
            id: 9,
            title: "Write The JS",
            done: "49",
            rowId: 3,
            startDate: "06-08-2024",
            endDate: "09-08-2024",
            startTime: '15:00:00',
            endTime: '23:00:00',
            details: "this is a test",
            color: '#A5D6A7',
        },
        {
            id: 10,
            title: "Advertise",
            done: "88",
            rowId: 2,
            startDate: "19-08-2024",
            endDate: "23-08-2024",
            startTime: '16:00:00',
            endTime: '00:00:00',
            details: "this is a test?",
            color: '#FF8A65',
        },
        {
            id: 11,
            title: "Sketch",
            done: "55",
            rowId: 2,
            startDate: "21-08-2024",
            endDate: "24-08-2024",
            startTime: '17:00:00',
            endTime: '01:00:00',
            details: "this is a test",
            color: '#A5D6A7',
        },
    ]

    holidays: string[] = [];

    get weekEnds(): number[] {
        return [0, 6]; // Sunday, Saturday
    }

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
