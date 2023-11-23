import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { AllaganReportSource } from '@ffxiv-teamcraft/types';
import { AllaganReportQueueEntry } from '../model/allagan-report-queue-entry';
import { AllaganReport } from '../model/allagan-report';
import { AllaganReportStatus } from '../model/allagan-report-status';
import { UserLevel } from '../../../model/other/user-level';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { OceanFishingTime } from '../model/ocean-fishing-time';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { merge } from 'rxjs';
import { observeInput } from '../../../core/rxjs/observe-input';
import { filter, map, switchMap } from 'rxjs/operators';
import { SpearfishingShadowSize } from '@ffxiv-teamcraft/types';
import { SpearfishingSpeed } from '@ffxiv-teamcraft/types';
import { SettingsService } from '../../../modules/settings/settings.service';
import { TugNamePipe } from '../../../pipes/pipes/tug-name.pipe';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { IsVerifiedPipe } from '../../../pipes/pipes/is-verified.pipe';
import { IsPatronPipe } from '../../../pipes/pipes/is-patron.pipe';
import { UserLevelPipe } from '../../../pipes/pipes/user-level.pipe';
import { CharacterAvatarPipe } from '../../../pipes/pipes/character-avatar.pipe';
import { WeatherIconPipe } from '../../../pipes/pipes/weather-icon.pipe';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { XivapiIconPipe } from '../../../pipes/pipes/xivapi-icon.pipe';
import { ActionNamePipe } from '../../../pipes/pipes/action-name.pipe';
import { ActionIconPipe } from '../../../pipes/pipes/action-icon.pipe';
import { ItemNamePipe } from '../../../pipes/pipes/item-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { RouterLink } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { SpearfishingSpeedComponent } from '../../../modules/spearfishing-speed-tooltip/spearfishing-speed/spearfishing-speed.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { DbButtonComponent } from '../../../core/db-button/db-button.component';
import { ReportSourceCompactDetailsComponent } from '../report-source-compact-details/report-source-compact-details.component';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { ReportSourceDisplayComponent } from '../report-source-display/report-source-display.component';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
    selector: 'app-allagan-report-row',
    templateUrl: './allagan-report-row.component.html',
    styleUrls: ['./allagan-report-row.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NzGridModule, FlexModule, ReportSourceDisplayComponent, NgIf, NzTagModule, NzToolTipModule, NzButtonModule, NzWaveModule, NzIconModule, NzPopconfirmModule, NgSwitch, ReportSourceCompactDetailsComponent, NgSwitchCase, DbButtonComponent, NgTemplateOutlet, NgFor, ItemIconComponent, I18nNameComponent, SpearfishingSpeedComponent, NzAvatarModule, RouterLink, AsyncPipe, DatePipe, I18nPipe, TranslateModule, I18nRowPipe, ItemNamePipe, ActionIconPipe, ActionNamePipe, XivapiIconPipe, CharacterNamePipe, WeatherIconPipe, CharacterAvatarPipe, UserLevelPipe, IsPatronPipe, IsVerifiedPipe, MapNamePipe, TugNamePipe]
})
export class AllaganReportRowComponent {

  AllaganReportSource = AllaganReportSource;

  AllaganReportStatus = AllaganReportStatus;

  OceanFishingTime = OceanFishingTime;

  UserLevel = UserLevel;

  SpearfishingSpeed = SpearfishingSpeed;

  SpearfishingShadowSize = SpearfishingShadowSize;

  canSuggestDeletionOrModification = false;

  @Input()
  queueEntry: AllaganReportQueueEntry;

  @Input()
  report: AllaganReport;

  @Input()
  userIsChecker = false;

  @Input()
  userId: string;

  @Input()
  embed = false;

  @Input()
  focusId: string | null;

  @Output()
  accept = new EventEmitter<void>();

  @Output()
  reject = new EventEmitter<void>();

  @Output()
  delete = new EventEmitter<void>();

  @Output()
  deleteOwn = new EventEmitter<void>();

  @Output()
  edit = new EventEmitter<void>();

  applyingChange = false;

  fishingSpot$ = merge(
    observeInput(this, 'report', true),
    observeInput(this, 'queueEntry', true)
  ).pipe(
    filter(report => !!report),
    switchMap(report => {
      const data = report.data;
      return this.lazyData.getEntry('fishingSpots').pipe(
        map(fishingSpots => fishingSpots.find(s => s.id === data.spot))
      );
    })
  );

  constructor(public translate: TranslateService, private lazyData: LazyDataFacade, public settings: SettingsService) {
  }

  @Input()
  set reportsQueue(queue: AllaganReportQueueEntry[]) {
    this.canSuggestDeletionOrModification = !this.embed && queue && !queue.some(entry => entry.report === this.report?.uid && [AllaganReportStatus.DELETION, AllaganReportStatus.MODIFICATION].includes(entry.type));
  }

  get itemId(): number {
    return (this.report || this.queueEntry)?.itemId;
  }

  get source(): AllaganReportSource {
    return (this.report || this.queueEntry)?.source;
  }

  get data(): any {
    return (this.report || this.queueEntry)?.data;
  }

  get author(): string {
    return this.report?.reporter || this.queueEntry?.author;
  }

  get status(): AllaganReportStatus {
    return this.queueEntry?.type || AllaganReportStatus.ACCEPTED;
  }

  get hookset(): any {
    return [0, 4103, 4179][this.data.hookset];
  }

  getColor(status: AllaganReportStatus): string {
    switch (status) {
      case AllaganReportStatus.ACCEPTED:
        return 'darkgreen';
      case AllaganReportStatus.DELETION:
        return '#f50';
      case AllaganReportStatus.MODIFICATION:
        return '#f2b10e';
      case AllaganReportStatus.PROPOSAL:
        return '#108ee9';
    }
  }

}
