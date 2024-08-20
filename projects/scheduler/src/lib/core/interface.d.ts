export interface TableRow {
    label: string;
    prefix: string;
    suffix: string;
    classList: string;
    value: string | number;
}

export interface BaseTableEvent {
    title: string;
    id: string | number;
    status: string;
}

export interface TableEvent {
    columnStart: number | null;
    columnEnd: number | null;
    rowStart: number;
    rowEnd: number;
    data: BaseTableEvent;
    offsetX: number;
    fractionX: number;
}

export interface ViewButton {
    id: string;
    name: string;
}
