import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DateChangeService {
    private _next = new Subject<void>();
    private _prev = new Subject<void>();
    private _today = new Subject<void>();
    private _dateChange = new Subject<Date>();
    private _download = new Subject<void>();

    private _next$ = this._next.asObservable();
    private _prev$ = this._prev.asObservable();
    private _today$ = this._today.asObservable();
    private _dateChange$ = this._dateChange.asObservable();
    private _download$ = this._download.asObservable();

    constructor() {}

    next(): void {
        this._next.next();
    }

    previous(): void {
        this._prev.next();
    }

    today(): void {
        this._today.next();
    }

    setDate(date: Date): void {
        this._dateChange.next(date);
    }

    download(): void {
        this._download.next();
    }

    onNext(): Observable<void> {
        return this._next$;
    }

    onPrevious(): Observable<void> {
        return this._prev$;
    }

    onToday(): Observable<void> {
        return this._today$;
    }

    onSetDate(): Observable<Date> {
        return this._dateChange$;
    }

    onDownload(): Observable<void> {
        return this._download$;
    }
}