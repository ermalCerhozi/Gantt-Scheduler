import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { parse, format } from 'date-fns';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';


@Component({
    selector: 'app-event-update',
    templateUrl: './event-update.component.html',
    styleUrl: './event-update.component.scss',
    standalone: true,
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,    
        MatCheckboxModule,
    ],
    providers: [provideNativeDateAdapter()],
})
export class EventUpdateComponent {
    form: FormGroup = new FormGroup({
        startDate: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        endDate: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        color: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        title: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        rowId: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        startTime: new FormControl(null),
        endTime: new FormControl(null),
        id: new FormControl(null),
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<EventUpdateComponent>,
    ) {}

    ngOnInit(): void {
        this.setFormValues();
    }

    setFormValues(): void{
        const event = this.data.event;

        const startDate = new Date(event.startDate.split('-').reverse().join('-'));
        const endDate = new Date(event.endDate.split('-').reverse().join('-'));    

        this.form.setValue({
            startDate: startDate,
            endDate: endDate,
            color: event.color,
            title: event.title,
            startTime: event.startTime?.substring(0,5),
            endTime:  event.endTime?.substring(0,5),
            id: event.id,
            rowId: event.rowId
        })
    }

    get colorValue(): string{
        return this.form.controls['color'].value as string;
    }
    
    onSubmit(): void {
        const event = { ...this.form.value };
        // Ensure time has seconds for the gantt to work properly
        event.startTime = event.startTime?.length === 5 ? `${event.startTime}:00` : event.startTime;
        event.endTime = event.endTime?.length === 5 ? `${event.endTime}:00` : event.endTime;

        const startDateString = format(event.startDate, 'dd-MM-yyyy');
        const endDateString = format(event.endDate, 'dd-MM-yyyy');
    
        event.startDate = format(parse(startDateString, 'dd-MM-yyyy', new Date()), 'dd-MM-yyyy');
        event.endDate = format(parse(endDateString, 'dd-MM-yyyy', new Date()), 'dd-MM-yyyy');
    
        this.dialogRef.close(event);
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
