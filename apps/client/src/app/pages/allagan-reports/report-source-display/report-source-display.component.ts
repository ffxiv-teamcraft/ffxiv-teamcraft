import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AllaganReportSource } from '@ffxiv-teamcraft/types';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { NodeTypeIconPipe } from '../../../pipes/pipes/node-type-icon.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NgSwitch, NgSwitchCase } from '@angular/common';
import { FlexModule } from '@angular/flex-layout/flex';

@Component({
    selector: 'app-report-source-display',
    templateUrl: './report-source-display.component.html',
    styleUrls: ['./report-source-display.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FlexModule, NgSwitch, NgSwitchCase, NzButtonModule, NzIconModule, TranslateModule, NodeTypeIconPipe, LazyIconPipe]
})
export class ReportSourceDisplayComponent {

  AllaganReportSource = AllaganReportSource;

  @Input()
  source: AllaganReportSource;

}
