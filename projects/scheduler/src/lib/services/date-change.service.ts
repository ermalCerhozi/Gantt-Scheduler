import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateChangeService {
  private readonly _nextTrigger = signal<number>(0);
  private readonly _previousTrigger = signal<number>(0);
  private readonly _todayTrigger = signal<number>(0);
  private readonly _currentDate = signal<Date | null>(null);
  private readonly _downloadTrigger = signal<number>(0);

  readonly nextTrigger = this._nextTrigger.asReadonly();
  readonly previousTrigger = this._previousTrigger.asReadonly();
  readonly todayTrigger = this._todayTrigger.asReadonly();
  readonly currentDate = this._currentDate.asReadonly();
  readonly downloadTrigger = this._downloadTrigger.asReadonly();

  constructor() {}

  next(): void {
    this._nextTrigger.update(count => count + 1);
  }

  previous(): void {
    this._previousTrigger.update(count => count + 1);
  }

  today(): void {
    this._todayTrigger.update(count => count + 1);
  }

  setDate(date: Date): void {
    this._currentDate.set(date);
  }

  download(): void {
    this._downloadTrigger.update(count => count + 1);
  }

  getCurrentDate(): Date | null {
    return this._currentDate();
  }

  resetDate(): void {
    this._currentDate.set(null);
  }
}