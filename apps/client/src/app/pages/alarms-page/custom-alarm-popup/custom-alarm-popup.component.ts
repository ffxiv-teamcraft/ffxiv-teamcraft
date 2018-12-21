import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { map, shareReplay } from 'rxjs/operators';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-custom-alarm-popup',
  templateUrl: './custom-alarm-popup.component.html',
  styleUrls: ['./custom-alarm-popup.component.less']
})
export class CustomAlarmPopupComponent {

  form: FormGroup;

  public maps$: Observable<any[]>;

  constructor(private fb: FormBuilder, private xivapi: XivapiService, private alarmsFacade: AlarmsFacade, private modalRef: NzModalRef) {
    this.maps$ = this.xivapi.getList(XivapiEndpoint.Map, { columns: ['ID', 'PlaceName.Name_*'], max_items: 1000 }).pipe(
      map(list => list.Results),
      shareReplay(1)
    );
    this.form = this.fb.group({
      name: ['', Validators.required],
      spawn: [0, [Validators.min(0), Validators.max(24)]],
      spawnsTwice: [false],
      duration: [1, Validators.required],
      slot: [undefined],
      type: [undefined, [Validators.min(0), Validators.max(4)]],
      mapId: [undefined],
      x: [undefined],
      y: [undefined]
    });
  }

  submit(): void {
    const data = this.form.getRawValue();
    const alarm: Partial<Alarm> = {
      name: data.name,
      spawns: data.spawnsTwice ? [data.spawn, (data.spawn + 12) % 24] : [data.spawn],
      duration: data.duration
    };
    if (data.slot !== undefined) {
      alarm.slot = data.slot;
    }
    if (data.type !== undefined) {
      alarm.type = data.type;
    }
    if (data.mapId !== undefined) {
      alarm.mapId = data.mapId;
    }
    if (data.x !== undefined || data.y !== undefined) {
      alarm.coords = { x: data.x || 0, y: data.y || 0 };
    }
    this.alarmsFacade.addAlarms(<Alarm>alarm);
    this.modalRef.close();
  }

}
