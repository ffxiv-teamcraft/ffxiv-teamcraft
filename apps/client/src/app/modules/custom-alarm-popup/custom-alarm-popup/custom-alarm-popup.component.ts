import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { map, shareReplay } from 'rxjs/operators';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { NzModalRef } from 'ng-zorro-antd';
import * as weathers from '../../../core/data/sources/weathers.json';

@Component({
  selector: 'app-custom-alarm-popup',
  templateUrl: './custom-alarm-popup.component.html',
  styleUrls: ['./custom-alarm-popup.component.less']
})
export class CustomAlarmPopupComponent implements OnInit {

  form: FormGroup;

  public maps$: Observable<any[]>;

  public weatherIds: any[] = Object.keys(weathers).map(key => +key);

  /**
   * Should we just return the alarm instead of creating it directly?
   */
  public returnAlarm = false;

  public name = '';

  public mapId: number;

  public type: number;

  public x: number;

  public y: number;

  public slot: string | number;

  public spawnsTwice = false;

  public spawn = 0;

  public duration = 1;

  public weathers: number[] = [];

  public weathersFrom: number[] = [];

  constructor(private fb: FormBuilder, private xivapi: XivapiService, private alarmsFacade: AlarmsFacade, private modalRef: NzModalRef) {
    this.maps$ = this.xivapi.getList(XivapiEndpoint.Map, { columns: ['ID', 'PlaceName.Name_*'], max_items: 1000 }).pipe(
      map(list => list.Results),
      shareReplay(1)
    );
  }

  submit(): void {
    const data = this.form.getRawValue();
    const alarm: Partial<Alarm> = {
      name: data.name
    };
    if (data.spawn) {
      alarm.spawns = data.spawnsTwice ? [data.spawn, (data.spawn + 12) % 24] : [data.spawn];
      alarm.duration = data.duration;
    }
    if (data.slot !== undefined) {
      alarm.slot = data.slot;
    }
    if (data.type !== undefined) {
      alarm.type = data.type;
    }
    if (data.mapId !== undefined) {
      alarm.mapId = data.mapId;
    }
    if (data.weathers && data.weathers.length > 0) {
      alarm.weathers = data.weathers;
    }
    if (data.weathersFrom && data.weathersFrom.length > 0) {
      alarm.weathersFrom = data.weathersFrom;
    }
    if (data.x !== undefined || data.y !== undefined) {
      alarm.coords = { x: data.x || 0, y: data.y || 0 };
    }
    if (this.returnAlarm) {
      this.modalRef.close(<Alarm>alarm);
    } else {
      this.alarmsFacade.addAlarms(<Alarm>alarm);
      this.modalRef.close();
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.name, Validators.required],
      spawn: [this.spawn, [Validators.min(0), Validators.max(24)]],
      spawnsTwice: [this.spawnsTwice],
      duration: [this.duration],
      slot: [this.slot],
      type: [this.type, [Validators.min(0), Validators.max(4)]],
      mapId: [this.mapId, Validators.required],
      x: [this.x],
      y: [this.y],
      weathers: [this.weathers],
      weathersFrom: [this.weathersFrom]
    });
  }

}
