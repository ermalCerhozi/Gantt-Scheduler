import { AfterViewInit, Component, ElementRef, effect, input, output, signal, ViewChild, computed, DestroyRef, inject } from "@angular/core";
import { select, timeParse, scaleTime, axisTop, timeFormat, timeDay, Selection, BaseType } from 'd3';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ProcessedEvent {
    id: string;
    rowId: string;
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    color: string;
    y: number;
}

interface RowMetric {
    rowId: string;
    title: string;
    count: number;
    startY: number;
    height: number;
}

interface ChartDimensions {
    width: number;
    height: number;
    topPadding: number;
    eventHeight: number;
    gutter: number;
    eventsGap: number;
}

@Component({
    selector: 'gantt-chart',
    templateUrl: './gantt-chart.component.html',
    styleUrl: './gantt-chart.component.scss',
    standalone: true
})
export class GanttChartComponent implements AfterViewInit {
    @ViewChild('chart') private chartContainer!: ElementRef<HTMLElement>;
    @ViewChild('chartVertLabels') private chartVertLabelsContainer!: ElementRef<HTMLElement>;

    private readonly destroyRef = inject(DestroyRef);

    readonly tableRows = input<any[]>([]);
    readonly events = input<any[]>([]);
    readonly title = input<string>('');
    readonly view = input<string>('month');
    readonly year = input<number>(new Date().getFullYear());
    readonly month = input<number>(new Date().getMonth() + 1);
    readonly daysOfMonth = input<number>(31);
    readonly startOfWeek = input<string>('');
    readonly endOfWeek = input<string>('');
    readonly day = input<number>(1);

    readonly eventClicked = output<any>();

    private readonly flatEvents = signal<ProcessedEvent[]>([]);
    private readonly rowMetrics = signal<RowMetric[]>([]);
    private readonly chartInitialized = signal<boolean>(false);

    private svg: Selection<SVGSVGElement, unknown, null, undefined> | null = null;
    private verticalLabelsSVG: Selection<SVGSVGElement, unknown, null, undefined> | null = null;
    private dateFormat = timeParse("%d-%m-%Y %H:%M:%S");
    private timeScale: any = null;

    private dragState = {
        selectedElement: null as Selection<SVGGElement, ProcessedEvent, any, unknown> | null,
        startX: 0,
        startY: 0,
        isDragging: false
    };

    private readonly dimensions: ChartDimensions = {
        width: 1400,
        height: 0,
        topPadding: 75,
        eventHeight: 48,
        gutter: 4,
        eventsGap: 52
    };

    private readonly timeRangeChanged = computed(() => {
        return {
            view: this.view(),
            year: this.year(),
            month: this.month(),
            day: this.day(),
            daysOfMonth: this.daysOfMonth(),
            startOfWeek: this.startOfWeek(),
            endOfWeek: this.endOfWeek()
        };
    });

    private readonly dataChanged = computed(() => {
        return {
            tableRows: this.tableRows(),
            events: this.events()
        };
    });

    private readonly titleChanged = computed(() => {
        return this.title();
    });

    constructor() {
        effect(() => {
            this.dataChanged();
            this.processAndFlattenEvents();
            
            if (this.chartInitialized()) {
                if (!this.svg) {
                    this.createChart();
                } else {
                    this.updateEventsAndLabels();
                }
            }
        });

        effect(() => {
            this.timeRangeChanged();
            if (this.chartInitialized()) {
                this.redrawChart();
            }
        });

        effect(() => {
            this.titleChanged();
            if (this.chartInitialized() && this.svg) {
                this.updateTitle();
            }
        });
    }

    ngAfterViewInit() {
        this.chartInitialized.set(true);
    }

    private processAndFlattenEvents(): void {
        const events: ProcessedEvent[] = [];
        const metrics: RowMetric[] = [];
        let currentY = this.dimensions.topPadding;

        const tableRowsData = this.tableRows();
        const eventsData = this.events();

        if (!tableRowsData || !eventsData) {
            this.dimensions.height = currentY;
            this.flatEvents.set([]);
            this.rowMetrics.set([]);
            return;
        }

        tableRowsData.forEach(row => {
            const eventGroup = eventsData.find(e => e.rowId === row.id);

            if (eventGroup?.events?.length > 0) {
                const rowEventCount = eventGroup.events.length;
                
                metrics.push({
                    rowId: row.id,
                    title: row.title,
                    count: rowEventCount,
                    startY: currentY,
                    height: rowEventCount * this.dimensions.eventsGap
                });

                eventGroup.events.forEach((event: any) => {
                    events.push({ ...event, y: currentY });
                    currentY += this.dimensions.eventsGap;
                });
            }
        });

        this.dimensions.height = currentY;
        this.flatEvents.set(events);
        this.rowMetrics.set(metrics);
    }

    private removeSVG(): void {
        if (this.chartContainer?.nativeElement) {
        select(this.chartContainer.nativeElement).select("svg").remove();
        }
        if (this.chartVertLabelsContainer?.nativeElement) {
        select(this.chartVertLabelsContainer.nativeElement).select("svg").remove();
        }
        this.svg = null;
        this.verticalLabelsSVG = null;
    }

    private redrawChart(): void {
        if (this.chartContainer && this.svg) {
            this.removeSVG();
            this.createChart();
        }
    }

    private updateEventsAndLabels(): void {
        if (!this.svg || !this.verticalLabelsSVG) return;

        this.svg.selectAll('.event-group').remove();
        this.svg.selectAll('.table-shadow').remove();
        this.verticalLabelsSVG.selectAll('text').remove();

        this.drawTableShadow();
        this.drawEvents();
        this.setupEventInteractions();
        this.updateVerticalLabels();
    }

    private updateTitle(): void {
        if (!this.svg) return;
        
        this.svg.select('.chart-title').remove();
        this.drawTitle();
    }

    private updateVerticalLabels(): void {
        if (!this.verticalLabelsSVG) return;

        this.verticalLabelsSVG.selectAll('text').remove();
        
        this.verticalLabelsSVG.append("g")
            .selectAll("text")
            .data(this.rowMetrics())
            .enter()
            .append("text")
            .text((d: RowMetric) => this.truncateText(d.title, 70, 16))
            .attr("x", 10)
            .attr("y", (d: RowMetric) => d.startY + d.height / 2)
            .attr("font-size", 16);
    }

    private createChart(): void {
        const events = this.flatEvents();
        const tableRowsData = this.tableRows();

        if (!tableRowsData?.length || !events.length) {
            return;
        }

        if (this.svg) {
            return;
        }

        this.removeSVG();

        this.initializeSVG();
        this.setupTimeScale();
        this.renderChart();
    }

    private initializeSVG(): void {
        const element = this.chartContainer.nativeElement;

        this.svg = select(element)
            .append("svg")
            .attr("width", this.dimensions.width)
            .attr("height", this.dimensions.height)
            .attr("class", "svg");
    }

    private setupTimeScale(): void {
        const view = this.view();
        
        switch (view) {
            case 'day':
                this.timeScale = scaleTime()
                    .domain([
                        new Date(this.year(), this.month() - 1, this.day()),
                        new Date(this.year(), this.month() - 1, this.day() + 1)
                    ])
                    .range([0, this.dimensions.width - 1]);
                break;
                
            case 'week':
                const { startDate, endDate } = this.parseWeekDates();
                this.timeScale = scaleTime()
                    .domain([startDate, new Date(endDate.getTime() + 24 * 60 * 60 * 1000)])
                    .range([0, this.dimensions.width - 1]);
                break;
                
            case 'month':
                this.timeScale = scaleTime()
                    .domain([
                        new Date(this.year(), this.month() - 1, 1),
                        new Date(this.year(), this.month() - 1, this.daysOfMonth() + 1)
                    ])
                    .range([0, this.dimensions.width - 1]);
                break;
                
            default:
                console.error(`Unknown view: ${view}`);
        }
    }

    private parseWeekDates(): { startDate: Date; endDate: Date } {
        const startOfWeekValue = this.startOfWeek();
        const endOfWeekValue = this.endOfWeek();
        
        if (!startOfWeekValue || !endOfWeekValue) {
            const today = new Date();
            const dayOfWeek = today.getDay();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - dayOfWeek);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            return { startDate, endDate };
        }
        
        const startOfWeekDate = startOfWeekValue.split('T')[0];
        const endOfWeekDate = endOfWeekValue.split('T')[0];
        
        const [startYear, startMonth, startDay] = startOfWeekDate.split('-').map(Number);
        const [endYear, endMonth, endDay] = endOfWeekDate.split('-').map(Number);
        
        return {
            startDate: new Date(startYear, startMonth - 1, startDay),
            endDate: new Date(endYear, endMonth - 1, endDay)
        };
    }

    private renderChart(): void {
        if (!this.svg) return;

        this.makeGrid();
        this.drawTableShadow();
        this.drawEvents();
        this.createVerticalLabels();
        this.setupEventInteractions();
        this.drawTitle();
    }

    private makeGrid(): void {
        if (!this.svg) return;

        const xAxis = axisTop(this.timeScale)
            .ticks(timeDay)
            .tickSize(-this.dimensions.height + this.dimensions.topPadding)
            .tickSizeOuter(0)
            .tickFormat(this.getTickFormat());

        this.svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0, ${this.dimensions.topPadding - this.dimensions.gutter / 2})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("stroke", "none")
            .attr("font-size", 14)
            .attr("dx", "2em");
    }

    private getTickFormat(): (domainValue: any) => string {
        const view = this.view();
        
        switch (view) {
            case 'day':
                return (domainValue: any) => timeFormat('%A')(domainValue as Date);
            case 'week':
                return (domainValue: any) => timeFormat('%d %b')(domainValue as Date);
            default:
                return (domainValue: any) => timeFormat('%d')(domainValue as Date);
        }
    }

    private drawTableShadow(): void {
        if (!this.svg) return;

        this.svg.append("g")
            .attr("class", "table-shadow")
            .selectAll("rect")
            .data(this.rowMetrics())
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d: RowMetric) => d.startY - 2)
            .attr("width", this.dimensions.width)
            .attr("height", (d: RowMetric) => d.height)
            .attr("stroke", "none")
            .attr("fill", (d: RowMetric, i: number) => i % 2 === 0 ? '#BDBDBD' : '#000')
            .attr("opacity", 0.1);
    }

    private truncateText(text: string, maxWidth: number, fontSize: number): string {
        const avgCharWidth = fontSize * 0.6;
        const maxChars = Math.floor(maxWidth / avgCharWidth);
        
        if (text.length <= maxChars) {
            return text;
        }
        
        return text.substring(0, maxChars - 3) + '...';
        
    }

    private drawEvents(): void {
        if (!this.svg || !this.dateFormat) return;

        const eventGroups: Selection<SVGGElement, ProcessedEvent, SVGGElement, unknown> = this.svg.append('g')
            .selectAll<SVGGElement, ProcessedEvent>('g')
            .data(this.flatEvents())
            .enter()
            .append('g')
            .attr('class', 'event-group')
            .style('cursor', 'pointer');

        eventGroups.append('rect')
            .attr("class", "event-rect")
            .attr("x", (d: ProcessedEvent) => this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`)))
            .attr("y", (d: ProcessedEvent) => d.y)
            .attr("width", (d: ProcessedEvent) => {
                const startTime = this.dateFormat(`${d.startDate} ${d.startTime}`);
                const endTime = this.dateFormat(`${d.endDate} ${d.endTime}`);
                if (startTime && endTime) {
                    return this.timeScale(endTime) - this.timeScale(startTime);
                }
                return 0;
            })
            .attr("height", this.dimensions.eventHeight)
            .attr("stroke", "none")
            .attr("fill", (d: ProcessedEvent) => d.color)
            .attr("rx", 8)
            .attr("ry", 8);

        eventGroups.append("text")
            .attr("class", "event-title")
            .attr("x", (d: ProcessedEvent) => this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`)) + 8)
            .attr("y", (d: ProcessedEvent) => d.y + 20)
            .attr("font-size", 14)
            .attr("clip-path", (d: ProcessedEvent) => `url(#clip-${d.id})`)
            .text((d: ProcessedEvent) => {
                const startTime = this.dateFormat(`${d.startDate} ${d.startTime}`);
                const endTime = this.dateFormat(`${d.endDate} ${d.endTime}`);
                if (startTime && endTime) {
                    const eventWidth = this.timeScale(endTime) - this.timeScale(startTime);
                    const availableWidth = eventWidth - 30;
                    return this.truncateText(d.title.toUpperCase(), availableWidth, 14);
                }
                return d.title.toUpperCase();
            });

        eventGroups.append("text")
            .attr("class", "event-time")
            .attr("x", (d: ProcessedEvent) => this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`)) + 8)
            .attr("y", (d: ProcessedEvent) => d.y + 35)
            .attr("font-size", 12)
            .attr("fill", "#555")
            .attr("clip-path", (d: ProcessedEvent) => `url(#clip-${d.id})`)
            .text((d: ProcessedEvent) => {
                const startTime = d.startTime.split(':').slice(0, 2).join(':');
                const endTime = d.endTime.split(':').slice(0, 2).join(':');
                const timeText = `${startTime} - ${endTime}`;
                
                const startDateTime = this.dateFormat(`${d.startDate} ${d.startTime}`);
                const endDateTime = this.dateFormat(`${d.endDate} ${d.endTime}`);
                if (startDateTime && endDateTime) {
                    const eventWidth = this.timeScale(endDateTime) - this.timeScale(startDateTime);
                    const availableWidth = eventWidth - 30;
                    return this.truncateText(timeText, availableWidth, 12);
                }
                return timeText;
            });

        eventGroups.append("text")
            .attr("class", "event-edit")
            .text('✏️')
            .attr("x", (d: ProcessedEvent) => {
                const endTime = this.dateFormat(`${d.endDate} ${d.endTime}`);
                return endTime ? this.timeScale(endTime) - 15 : 0;
            })
            .attr("y", (d: ProcessedEvent) => d.y + (this.dimensions.eventHeight / 2))
            .attr("dy", "0.35em")
            .attr("font-size", 16)
            .attr("text-anchor", "middle")
            .style("cursor", "pointer")
            .on('click', (event: Event, d: ProcessedEvent) => {
                event.stopPropagation();
                this.eventClicked.emit(d);
            });
    }

    private createVerticalLabels(): void {
        const element = this.chartVertLabelsContainer.nativeElement;

        this.verticalLabelsSVG = select(element)
            .append("svg")
            .attr("width", 80)
            .attr("height", this.dimensions.height)
            .attr("class", "svg");

        this.updateVerticalLabels();
    }

    private drawTitle(): void {
        if (!this.svg) return;

        this.svg.append("text")
            .attr("class", "chart-title")
            .text(this.title())
            .attr("x", this.dimensions.width / 2)
            .attr("y", 24)
            .attr("text-anchor", "middle")
            .attr("font-size", 18)
            .attr("fill", "#009FFC");
    }

    private setupEventInteractions(): void {
        if (!this.svg) return;

        const eventGroups: Selection<SVGGElement, ProcessedEvent, SVGSVGElement, unknown> = this.svg.selectAll<SVGGElement, ProcessedEvent>('g.event-group');
        
        // Store reference to this component for use in event handlers
        const componentRef = this;
        
        eventGroups.on('mousedown', function(event: MouseEvent, d: ProcessedEvent) {
            componentRef.handleDragStart(event, d, this);
        });
    }

    private handleDragStart(event: MouseEvent, d: ProcessedEvent, element: SVGGElement): void {
        this.dragState.selectedElement = select(element) as Selection<SVGGElement, ProcessedEvent, any, unknown>;
        this.dragState.startX = event.clientX;
        this.dragState.startY = event.clientY;

        const rect = this.dragState.selectedElement.select('rect') as Selection<SVGRectElement, ProcessedEvent, any, unknown>;
        const initialRectX = parseFloat(rect.attr('x'));
        const initialRectY = parseFloat(rect.attr('y'));

        // Disable text selection globally during drag
        document.body.style.userSelect = 'none';

        const onMouseMove = (moveEvent: MouseEvent) => {
            this.handleDragMove(moveEvent, rect, initialRectX, initialRectY);
        };

        const onMouseUp = () => {
            this.handleDragEnd(d, rect);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Re-enable text selection globally
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    private handleDragMove(
        moveEvent: MouseEvent, 
        rect: Selection<SVGRectElement, ProcessedEvent, any, unknown>, 
        initialRectX: number, 
        initialRectY: number
    ): void {
        if (!this.dragState.selectedElement) return;

        this.dragState.isDragging = true;
        const dx = moveEvent.clientX - this.dragState.startX;
        let newRectX = initialRectX + dx;

        const rectWidth = parseFloat(rect.attr('width'));
        newRectX = Math.max(0, Math.min(newRectX, this.dimensions.width - rectWidth));

        rect.attr('x', newRectX);
        
        const texts = this.dragState.selectedElement.selectAll('text') as Selection<SVGTextElement, ProcessedEvent, any, unknown>;
        const componentRef = this;
        
        texts.attr('x', function(textData: ProcessedEvent, i: number) {
            return i === 2 ? newRectX + rectWidth - 20 : newRectX + 8;
        }).attr('y', function(textData: ProcessedEvent, i: number) {
            return textData.y + (i === 0 ? 20 : i === 1 ? 35 : componentRef.dimensions.eventHeight / 2);
        });
    }

    private handleDragEnd(d: ProcessedEvent, rect: Selection<SVGRectElement, ProcessedEvent, any, unknown>): void {
        if (!this.dragState.isDragging || !this.dragState.selectedElement) {
            this.resetDragState();
            return;
        }

        const newX = parseFloat(rect.attr('x'));
        const rectWidth = parseFloat(rect.attr('width'));

        const newStartDateTime = this.timeScale.invert(newX);
        const newEndDateTime = this.timeScale.invert(newX + rectWidth);

        console.log('BEFORE:', d.startDate, d.startTime, '-', d.endDate, d.endTime);
        console.log('AFTER:', timeFormat("%d-%m-%Y")(newStartDateTime), timeFormat("%H:%M:%S")(newStartDateTime), '-', timeFormat("%d-%m-%Y")(newEndDateTime), timeFormat("%H:%M:%S")(newEndDateTime));

        this.updateEventData(d, newStartDateTime, newEndDateTime);
        this.resetDragState();
    }

    private updateEventData(event: ProcessedEvent, newStartDateTime: Date, newEndDateTime: Date): void {
        const eventsData = this.events();
        const eventGroup = eventsData.find(group => group.rowId === event.rowId);
        
        if (eventGroup) {
            const eventToUpdate = eventGroup.events.find((e: any) => e.id === event.id);
            if (eventToUpdate) {
                eventToUpdate.startDate = timeFormat("%d-%m-%Y")(newStartDateTime);
                eventToUpdate.startTime = timeFormat("%H:%M:%S")(newStartDateTime);
                eventToUpdate.endDate = timeFormat("%d-%m-%Y")(newEndDateTime);
                eventToUpdate.endTime = timeFormat("%H:%M:%S")(newEndDateTime);
            }
        }
    }

    private resetDragState(): void {
        this.dragState.selectedElement = null;
        this.dragState.isDragging = false;
    }

    generatePDF(): void {
        const ganttContainer = this.chartContainer.nativeElement.parentElement;
        if (!ganttContainer) return;

        html2canvas(ganttContainer).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'pt', [canvas.width, canvas.height]);
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('gantt-chart.pdf');
        });
    }
}