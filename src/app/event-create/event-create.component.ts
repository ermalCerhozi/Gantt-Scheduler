import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { formatDate, NgFor, NgIf } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
    selector: 'app-event-create',
    templateUrl: './event-create.component.html',
    styleUrl: './event-create.component.scss',
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
        NgFor,
        NgIf
    ],
    providers: [provideNativeDateAdapter()],
})
export class EventCreateComponent {
    form: FormGroup = new FormGroup({
        startDate: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        endDate: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        status: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        title: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        rowId: new FormControl(null, {validators: Validators.compose([Validators.required])}),
        startTime: new FormControl(null),
        endTime: new FormControl(null),
        allDay: new FormControl(true),
    });

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<EventCreateComponent>,
    ) {}

    ngOnInit(): void {
        this.form.controls['startTime'].setValue('00:00');
        this.form.controls['endTime'].setValue('23:59');
    }

    get colorValue(): string{
        return this.form.controls['status'].value as string;
    }
    
    onSubmit(): void {
        const startDate = new Date(this.form.controls['startDate'].value);
        const endDate = new Date(this.form.controls['endDate'].value);
    
        const formattedStartDate = formatDate(startDate, 'dd-MM-yyyy', 'en-US');
        const formattedEndDate = formatDate(endDate, 'dd-MM-yyyy', 'en-US');
        
        this.form.controls['startDate'].setValue(formattedStartDate);
        this.form.controls['endDate'].setValue(formattedEndDate);
    
        this.dialogRef.close(this.form.value);
    }

    onClose(): void {
        this.dialogRef.close();
    }
}
