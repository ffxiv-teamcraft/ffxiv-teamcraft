import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, Type } from '@angular/core';
import { ListRow } from '../../../modules/list/model/list-row';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { AlarmDisplay } from '../../../core/alarms/alarm-display';
import { AlarmGroup } from '../../../core/alarms/alarm-group';
import { Observable } from 'rxjs';
import { Alarm } from '../../../core/alarms/alarm';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { ItemDetailsPopup } from '../item-details/item-details-popup';
import { GatheredByComponent } from '../item-details/gathered-by/gathered-by.component';

@Component({
  selector: 'app-item-row',
  templateUrl: './item-row.component.html',
  styleUrls: ['./item-row.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemRowComponent implements OnInit {

  @Input()
  item: ListRow;

  @Input()
  finalItem = false;

  @Input()
  odd = false;

  alarmGroups$: Observable<AlarmGroup[]> = this.alarmsFacade.allGroups$;

  constructor(private listsFacade: ListsFacade, private alarmsFacade: AlarmsFacade,
              private messageService: NzMessageService, private translate: TranslateService,
              private modal: NzModalService, private l12n: LocalizedDataService,
              private i18n: I18nToolsService, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.cdRef.detectChanges();
    });
  }

  itemDoneChanged(newValue: number): void {
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, newValue - this.item.done);
  }

  markAsDone(): void {
    this.listsFacade.setItemDone(this.item.id, this.item.icon, this.finalItem, this.item.amount - this.item.done);
  }

  toggleAlarm(display: AlarmDisplay): void {
    if (display.registered) {
      this.alarmsFacade.deleteAlarm(display.alarm);
    } else {
      this.alarmsFacade.addAlarms(display.alarm);
    }
  }

  success(key: string, args?: any): void {
    this.messageService.success(this.translate.instant(key, args));
  }

  addAlarmWithGroup(alarm: Alarm, group: AlarmGroup) {
    alarm.groupId = group.$key;
    this.alarmsFacade.addAlarms(alarm);
  }

  public openGatheredByPopup(): void {
    this.openDetailsPopup(GatheredByComponent);
  }

  private openDetailsPopup(component: Type<ItemDetailsPopup>): void {
    this.modal.create({
      nzTitle: this.i18n.getName(this.l12n.getItem(this.item.id)),
      nzContent: component,
      nzComponentParams: { item: this.item },
      nzFooter: null
    });
  }
}
