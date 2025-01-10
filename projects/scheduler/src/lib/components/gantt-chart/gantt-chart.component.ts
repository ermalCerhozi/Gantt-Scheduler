import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import * as d3 from 'd3';

@Component({
  selector: 'gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrl: './gantt-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet],
})
export class GanttChartComponent implements AfterViewInit, OnChanges {
    @ViewChild('chart') private chartContainer!: ElementRef;
    @ViewChild('chartVertLabels') private chartVertLabelsContainer!: ElementRef;
    
    @Input('TableRows') tableRows!: any[];
    @Input('Events') events!: any[];
    @Input('Title') title!: string; //TODO: Maybe is better to calculete here using the data we have from the other inputs
    @Input('View') view!: string;

    @Input('Year') year!: number;
    @Input('Month') month!: number;
    @Input('DaysOfMonth') daysOfMonth!: number;
    @Input('StartOfWeek') startOfWeek!: string;
    @Input('EndOfWeek') endOfWeek!: string;
    @Input('Day') day!: number;
    
    @Output('eventClicked') eventClicked = new EventEmitter<any>();

    svg: any; //The gannt svg
    verticalLabelsSVG: any; //The table rows svg
    dateFormat: any;
    timeScale: any;
    numOccurances!: any[]; //The number of occurrences of events for each tableRow

    width: number = 1400;
    height: number = 0;
    topPadding: number = 75;
    eventHeight: number = 48;
    gutter: number = 4;
    eventsGap: number = this.eventHeight + this.gutter;

    //DRAG AND DROP
    newX = 0;
    newY = 0;
    startX = 0;
    startY = 0;
    selectedElement: any;
    isDragging = false;

    constructor() { }

    ngAfterViewInit() {
        this.orderEventsByRows(this.events, this.tableRows);
        this.calculateNumOccurrences(this.events, this.tableRows);
        this.calculateHeight();
        this.createChart();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['title'] || changes['events'] || changes['tableRow'] || changes['view']) {
            const titleChanged = changes['title'] && changes['title'].previousValue !== changes['title'].currentValue;
            const eventsChanged = changes['events'] && changes['events'].previousValue !== changes['events'].currentValue;
            const tableRowChanged = changes['tableRow'] && changes['tableRow'].previousValue !== changes['tableRow'].currentValue;
            const viewChanged = changes['view'] && changes['view'].previousValue !== changes['view'].currentValue;

            if (titleChanged || eventsChanged || tableRowChanged || viewChanged) {
                if (this.chartContainer && !d3.select(this.chartContainer.nativeElement).select("svg").empty()) {
                    this.orderEventsByRows(this.events, this.tableRows);
                    this.calculateNumOccurrences(this.events, this.tableRows);
                    this.calculateHeight();
                    this.removeSVG();
                    this.createChart();
                }
            }
        }
    }

    removeSVG(): void {
        d3.select(this.chartContainer.nativeElement).select("svg").remove();
        d3.select(this.chartVertLabelsContainer.nativeElement).select("svg").remove();
    }

    createChart() {
        if (!this.tableRows.length || !this.events.length) {
            return;
        }
        if (!d3.select(this.chartContainer.nativeElement).select("svg").empty()) {
            return;
        }

        const element = this.chartContainer.nativeElement;

        this.svg = d3.select(element)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("class", "svg");
        
        this.dateFormat = d3.timeParse("%d-%m-%Y %H:%M:%S");
        
        switch (this.view) {
            case 'day':
                this.timeScale = d3.scaleTime()
                    .domain([
                        new Date(this.year, this.month - 1, this.day),
                        new Date(this.year, this.month - 1, this.day + 1)
                    ])
                    .range([0, this.width - 1]);
                break;
            case 'week':
                const startOfWeekDate = this.startOfWeek.split('T')[0];
                const endOfWeekDate = this.endOfWeek.split('T')[0];
                const [startYear, startMonth, startDay] = startOfWeekDate.split('-').map(Number);
                const [endYear, endMonth, endDay] = endOfWeekDate.split('-').map(Number);
                this.timeScale = d3.scaleTime()
                    .domain([new Date(startYear, startMonth - 1, startDay), new Date(endYear, endMonth - 1, endDay + 1)])
                    .range([0, this.width - 1]);
                break;
            case 'month':
                this.timeScale = d3.scaleTime()
                    .domain([new Date(this.year, this.month - 1, 1), new Date(this.year, this.month - 1, (this.daysOfMonth + 1))])
                    .range([0, this.width - 1]);
                break;
            default:
                console.error(`Unknown view: ${this.view}`);
        }

        this.makeGrid();
        this.drawTableShadow();
        this.drawEvents();
        this.vertLabelsSvg();
        this.draggableEvents();
        this.resizableEvents();

        this.svg.append("text")
            .text(this.title)
            .attr("x", this.width / 2)
            .attr("y", 24)
            .attr("text-anchor", "middle")
            .attr("font-size", 18)
            .attr("fill", "#009FFC");
    }

    /*
    * Add a new rect elemtn in the place the elemnt is placed
    * when moving move the text as well
    */
    draggableEvents() {
        const eventGroups = this.svg.selectAll('g.event-group');
        const self = this;

        eventGroups.on('mousedown', (event: MouseEvent, d: any) => {
            self.selectedElement = d3.select(event.currentTarget as HTMLElement);
            self.startX = event.clientX;
            self.startY = event.clientY;

            const rect = self.selectedElement.select('rect');
            const texts = self.selectedElement.selectAll('text');
            const initialRectX = parseFloat(rect.attr('x'));
            const initialRectY = parseFloat(rect.attr('y'));

            const onMouseMove = function(moveEvent: MouseEvent) {
                if (self.selectedElement) {
                    self.isDragging = true;
                    const dx = moveEvent.clientX - self.startX;

                    let newRectX = initialRectX + dx;

                    // Horizontal boundaries
                    const chartWidth = self.width;
                    const rectWidth = parseFloat(rect.attr('width'));
                    if (newRectX < 0) newRectX = 0;
                    if (newRectX + rectWidth > chartWidth) newRectX = chartWidth - rectWidth;

                    // Update rect position
                    rect.attr('x', newRectX);

                    self.selectedElement.select('.full-line').attr('x', newRectX);

                    self.selectedElement.select('.progress-line').attr('x', newRectX);

                    // Update texts position relative to rect
                    texts.attr('x', newRectX + 8)
                         .attr('y', (d: any, i: number) => {
                             return initialRectY + (i === 0 ? 20 : 35); // Keep Y position unchanged
                         });
                }
            };

            const onMouseUp = function() {
                if (self.isDragging && self.selectedElement) {
                    const rect = self.selectedElement.select('rect');
                    const newX = parseFloat(rect.attr('x'));
                    const rectWidth = parseFloat(rect.attr('width'));

                    const newStartDateTime = self.timeScale.invert(newX);
                    const newEndDateTime = self.timeScale.invert(newX + rectWidth);

                    d.startDate = d3.timeFormat("%d-%m-%Y")(newStartDateTime);
                    d.startTime = d3.timeFormat("%H:%M:%S")(newStartDateTime);
                    d.endDate = d3.timeFormat("%d-%m-%Y")(newEndDateTime);
                    d.endTime = d3.timeFormat("%H:%M:%S")(newEndDateTime);
                    console.log(d);

                    self.updateEventPosition(self.selectedElement, d);
                }

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                self.selectedElement = null;
                self.isDragging = false;
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    updateEventPosition(eventGroup: any, eventData: any) {
        const rect = eventGroup.select('rect#element');
        const fullLine = eventGroup.select('.full-line');
        const progressLine = eventGroup.select('.progress-line');
        const titleText = eventGroup.select('text:nth-of-type(1)');
        const detailsText = eventGroup.select('text:nth-of-type(2)');

        const newX = this.timeScale(this.dateFormat(`${eventData.startDate} ${eventData.startTime}`));
        const newWidth = this.timeScale(this.dateFormat(`${eventData.endDate} ${eventData.endTime}`)) - newX;

        rect.attr('x', newX)
            .attr('width', newWidth);

        fullLine.attr('x', newX)
            .attr('width', newWidth);

        progressLine.attr('x', newX)
            .attr('width', newWidth * (eventData.done / 100));

        titleText.attr('x', newX + 8);
        detailsText.attr('x', newX + 8);
    }

    resizableEvents() { 
        // TODO: implement resizable events
    }

    makeGrid() {
        var xAxis = d3.axisTop(this.timeScale)
            .ticks(d3.timeDay)
            .tickSize(-this.height + this.topPadding)
            .tickSizeOuter(0)

            if (this.view === 'day') {
                xAxis.tickFormat((domainValue: any) => d3.timeFormat('%A')(domainValue as Date));
            } else if (this.view === 'week') {
                xAxis.tickFormat((domainValue: any) => d3.timeFormat('%d %b')(domainValue as Date));
            } else {
                xAxis.tickFormat((domainValue: any) => d3.timeFormat('%d')(domainValue as Date));
            }
    
        this.svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0, ' + (this.topPadding - this.gutter/2) + ')')
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("stroke", "none")
            .attr("font-size", 12)
            .attr("dx", "2em");
    }

    drawTableShadow() {
        this.svg.append("g")
        .selectAll("rect")
        .data(this.events)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d: any, i: any) => {
            return i * this.eventsGap + this.topPadding -2;
        })
        .attr("width", (d: any) => {
            return this.width;
        })
        .attr("height", this.eventsGap)
        .attr("stroke", "none")
        .attr("fill", (d: any) => {
            for (var i = 0; i < this.tableRows.length; i++) {
                if (d.rowId == this.tableRows[i].id) {
                    if( i%2 == 0 ){
                        return '#BDBDBD';
                    }
                }
            }
            return '#000';
        })
        .attr("opacity", 0.2);
    }

    drawEvents() {
        var eventGroups = this.svg.append('g')
            .selectAll('g')
            .data(this.events)
            .enter()
            .append('g')
            .attr('class', 'event-group')
            .style('cursor', 'pointer');

        eventGroups.append('rect')
            .attr("id", "element")
            .attr("x", (d: any) => {        
                return this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`));
            })
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + this.topPadding;
            })
            .attr("width", (d: any) => {
                return (this.timeScale(this.dateFormat(`${d.endDate} ${d.endTime}`)) - this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`)));
            })
            .attr("height", this.eventHeight)
            .attr("stroke", "none")
            .attr("fill", (d: any) => {
                for (var i = 0; i < this.tableRows.length; i++) {
                    if (d.rowId == this.tableRows[i].id) {
                        return d.color;
                    }
                }
            })
            .style("cursor", "pointer");

        eventGroups.append('rect')
            .attr("class", "full-line")
            .attr("x", (d: any) => {
                return this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`));
            })
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + this.topPadding;
            })
            .attr("width", (d: any) => {
                return this.timeScale(this.dateFormat(`${d.endDate} ${d.endTime}`)) - this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`));
            })
            .attr("height", 7)
            .attr("fill", "#FFFFFF");

        eventGroups.append('rect')
            .attr("class", "progress-line")
            .attr("x", (d: any) => {
                return this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`));
            })
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + this.topPadding;
            })
            .attr("width", (d: any) => {
                const eventWidth = this.timeScale(this.dateFormat(`${d.endDate} ${d.endTime}`)) - this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`));
                return eventWidth * (d.done / 100);
            })
            .attr("height", 5)
            .attr("fill", "#FF0000");

        eventGroups.append("text")
            .text((d: any) => d.title.toUpperCase())
            .attr("x", (d: any) => {
                return this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`)) + 8;
            })
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + this.topPadding + 20;
            })
            .attr("font-size", 14)
            .attr("text-anchor", "start")
            .attr("fill", "#000")

        eventGroups.append("text")
            .text((d: any) => {
                const startTime = d.startTime.split(':').slice(0, 2).join(':');
                const endTime = d.endTime.split(':').slice(0, 2).join(':');
                return d.done + '%' + '\u00A0\u00A0⬤\u00A0\u00A0' + `${startTime} - ${endTime}`;            })
            .attr("x", (d: any) => {
                return this.timeScale(this.dateFormat(`${d.startDate} ${d.startTime}`)) + 8;
            })
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + this.topPadding + 35;
            })
            .attr("font-size", 12)
            .attr("text-anchor", "start")
            .attr("fill", "#555")

        eventGroups.on('click', (data: any) => {
            if (!this.isDragging) {
                this.eventClicked.emit(data.srcElement.__data__);
            }
        });
    }

    vertLabelsSvg() {
        const element = this.chartVertLabelsContainer.nativeElement;

        this.verticalLabelsSVG = d3.select(element)
            .append("svg")
            .attr("width", 80)
            .attr("height", this.height)
            .attr("class", "svg");

            var preveventsGap = 0;

            this.verticalLabelsSVG.append("g")
                .selectAll("text")
                .data(this.numOccurances)
                .enter()
                .append("text")
                .text((d: any) => {
                    const row = this.tableRows.find(row => row.id === d[0]);
                    return row ? row.title : 'Not Found';
                })
                .attr("x", 10)
                .attr("y", (d: any, i: any) => {
                    if (i > 0) {
                        for (var j = 0; j < i; j++) {
                            preveventsGap += this.numOccurances[i - 1][1];
                            return d[1] * this.eventsGap / 2 + preveventsGap * this.eventsGap + this.topPadding;
                        }
                    } else {
                        return d[1] * this.eventsGap / 2 + this.topPadding;
                    }
                    return
                })
                .attr("font-size", 11)
                .attr("text-anchor", "start")
                .attr("text-height", 14)
                .attr("fill", (d: any) => {
                    for (var i = 0; i < this.tableRows.length; i++) {
                        if (d[0] == this.tableRows[i].id) {
                            return '#000';
                        }
                    }
                    return '#000';
                });
    }

    /*
    * It will order the events by the order of the tableRows
    */
    orderEventsByRows(events: any[], rows: any[]) {
        const rowOrderMap = rows.reduce((map: { [x: string]: any; }, row: { id: string | number; }, index: any) => {
            map[row.id] = index;
            return map;
        }, {});
    
        events.sort((a: { rowId: string | number; }, b: { rowId: string | number; }) => {
            return rowOrderMap[a.rowId] - rowOrderMap[b.rowId];
        });
    }

    /*
    * It will calculate the number of occurrences of events for each tableRow
    */
    calculateNumOccurrences(events: any[], rows: any[]): void {
        this.numOccurances = rows.map(row => {
            const count = events.filter(event => event.rowId === row.id).length;
            return [row.id, count];
        });
    }

    calculateHeight(): void {
        this.height = this.topPadding + this.events.length * (this.eventsGap);
    }}
