import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'app-xivdb-tooltip-component',
    templateUrl: './xivdb-tooltip.component.html',
    styleUrls: ['./xivdb-tooltip.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class XivdbTooltipComponent {

    @Input() innerHtml: string;

}
