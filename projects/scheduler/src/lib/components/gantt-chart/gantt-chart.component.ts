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
    // @ViewChild('elemnts') private elemnts!: ElementRef;
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

    width: number = 1200;
    height: number = 0;
    topPadding: number = 75;
    eventHeight: number = 25; //The height of the event
    eventsGap: number = this.eventHeight + 4; //The gap between events

    //DRAG AND DROP
    newX = 0;
    newY = 0;
    startX = 0;
    startY = 0;
    selectedElement: any;

    constructor(private el: ElementRef) { }

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
        
        this.dateFormat = d3.timeParse("%d-%m-%Y");
        
        switch (this.view) {
            case 'day':
                this.timeScale = d3.scaleTime()
                    .domain([new Date(this.year, this.month - 1, this.day), new Date(this.year, this.month - 1, this.day + 1)])
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
        this.drawEvents();
        this.vertLabelsSvg();
        this.draggableEvents();

        this.svg.append("text")
            .text(this.title)
            .attr("x", this.width / 2)
            .attr("y", 24)
            .attr("text-anchor", "middle")
            .attr("font-size", 18)
            .attr("fill", "#009FFC");
    }

    draggableEvents() {
        const cards = Array.from(this.el.nativeElement.querySelectorAll('rect') as NodeListOf<SVGRectElement>);
        
        cards.forEach((card: SVGRectElement) => {
            card.addEventListener('mousedown', (e: MouseEvent) => {
                this.selectedElement = e.target as SVGRectElement;
                this.startX = e.clientX - this.selectedElement.getBoundingClientRect().left;
                this.startY = e.clientY - this.selectedElement.getBoundingClientRect().top;
    
                const onMouseMove = (moveEvent: MouseEvent) => {
                    if (this.selectedElement) {
                        const dx = moveEvent.clientX - this.startX;
                        const dy = moveEvent.clientY - this.startY;
                        this.selectedElement.setAttribute('x', dx.toString());
                        this.selectedElement.setAttribute('y', dy.toString());
                    }
                };
    
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    this.selectedElement = null;
                };
    
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        });
    }

    makeGrid() {
        var xAxis = d3.axisTop(this.timeScale)
            .ticks(d3.timeDay)
            .tickSize(-this.height + (-this.topPadding) )
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
            .attr('transform', 'translate(' + 0 + ', ' + (this.height - 320) + ')')
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("stroke", "none")
            .attr("font-size", 12)
            .attr("dx", "2em");
    }

    drawEvents() {
        this.svg.append("g")
            .selectAll("rect")
            .data(this.events)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + this.topPadding;
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

        var rectangles = this.svg.append('g')
            .selectAll("rect")
            .data(this.events)
            .enter();

        var innerRects = rectangles.append("rect")
            .attr("id", "element")
            .attr("rx", 14)
            .attr("ry", 500)
            .attr("x", (d: any) => {
                return this.timeScale(this.dateFormat(d.startDate));
            })
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + this.topPadding;
            })
            .attr("width", (d: any) => {
                return (this.timeScale(this.dateFormat(d.endDate)) - this.timeScale(this.dateFormat(d.startDate)));
            })
            .attr("height", this.eventHeight)
            .attr("stroke", "none")
            .attr("fill", (d: any) => {
                for (var i = 0; i < this.tableRows.length; i++) {
                    if (d.rowId == this.tableRows[i].id) {
                        return d.status;
                    }
                }
            })
            .style("cursor", "pointer")
            .style("position", "fixed");

        rectangles.append("text")
            .text((d: any) => {
                return d.title;
            })
            .attr("x", (d: any) => {
                return (this.timeScale(this.dateFormat(d.endDate)) - this.timeScale(this.dateFormat(d.startDate))) / 2 + this.timeScale(this.dateFormat(d.startDate)); 
            })
            .attr("y", (d: any, i: any) => {
                return i * this.eventsGap + 14 + this.topPadding;
            })
            .attr("font-size", 11)
            .attr("text-anchor", "middle")
            .attr("text-height", this.eventHeight)
            .attr("fill", "#fff");

        innerRects.on('click', (data: any) => {
            this.eventClicked.emit(data.srcElement.__data__);
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
        this.height = this.topPadding + this.events.length * 29;
    }
}
