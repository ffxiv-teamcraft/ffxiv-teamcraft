import {Component, Input, ViewEncapsulation} from '@angular/core';
import {TooltipDataService} from './tooltip-data.service';

@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TooltipComponent {

    @Input()
    id: number;

    displayed = false;

    template: string;

    constructor(private tooltipData: TooltipDataService) {
    }

    display(): void {
        this.displayed = true;
        this.loadData();
    }

    hide(): void {
        this.displayed = false;
        this.template = '';
    }

    loadData(): void {
        this.tooltipData.getTooltipData(this.id).subscribe(data => this.template = data);
    }

}
