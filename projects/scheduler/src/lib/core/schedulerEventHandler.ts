export interface SchedulerEventHandler {
    todayButtonHandler(): void;
    previousButtonHandler(): void;
    nextButtonHandler(): void;
    eventChangesHandler(): void;
    tableRowChangesHandler(): void;
}