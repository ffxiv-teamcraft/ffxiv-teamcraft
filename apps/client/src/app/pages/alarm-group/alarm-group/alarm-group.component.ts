import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ltr } from 'semver';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { CharacterAvatarPipe } from '../../../pipes/pipes/character-avatar.pipe';
import { LazyIconPipe } from '../../../pipes/pipes/lazy-icon.pipe';
import { CharacterNamePipe } from '../../../pipes/pipes/character-name.pipe';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { AlarmButtonComponent } from '../../../modules/alarm-button/alarm-button/alarm-button.component';
import { I18nNameComponent } from '../../../core/i18n/i18n-name/i18n-name.component';
import { ItemIconComponent } from '../../../modules/item-icon/item-icon/item-icon.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { FlexModule } from '@angular/flex-layout/flex';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FullpageMessageComponent } from '../../../modules/fullpage-message/fullpage-message/fullpage-message.component';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { PageLoaderComponent } from '../../../modules/page-loader/page-loader/page-loader.component';

@Component({
    selector: 'app-alarm-group',
    templateUrl: './alarm-group.component.html',
    styleUrls: ['./alarm-group.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [PageLoaderComponent, NgIf, FullpageMessageComponent, NzCardModule, FlexModule, NzAvatarModule, NzButtonModule, NzWaveModule, NzToolTipModule, NzIconModule, NgFor, NzGridModule, ItemIconComponent, I18nNameComponent, AlarmButtonComponent, AsyncPipe, TranslateModule, I18nPipe, I18nRowPipe, CharacterNamePipe, LazyIconPipe, CharacterAvatarPipe, MapNamePipe]
})
export class AlarmGroupComponent {

  public group$ = this.alarmsFacade.externalGroup$;

  public outdated$ = this.group$.pipe(
    map(group => {
      return !group.notFound && ltr(group.appVersion, '8.0.0');
    })
  );

  public alarms$ = this.alarmsFacade.externalGroupAlarms$.pipe(
    distinctUntilChanged()
  );

  public alarmGroups$ = this.alarmsFacade.allGroups$;

  public addingGroupAndAlarms = false;

  constructor(route: ActivatedRoute, private alarmsFacade: AlarmsFacade) {
    route.paramMap.subscribe(paramMap => {
      this.alarmsFacade.loadExternalGroup(paramMap.get('key'));
    });
  }

  toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm as PersistedAlarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm as PersistedAlarm);
    }
  }

  addAlarmWithGroup(alarm: PersistedAlarm, group: AlarmGroup) {
    this.alarmsFacade.addAlarmInGroup(alarm, group);
  }

  cloneGroup(group: AlarmGroup, alarms: PersistedAlarm[]): void {
    this.addingGroupAndAlarms = true;
    this.alarmsFacade.addAlarmsAndGroup(alarms.map(a => {
      delete a.$key;
      return a;
    }), group.name, true);
  }

}
