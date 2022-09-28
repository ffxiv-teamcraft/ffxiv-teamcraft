import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { XivapiEndpoint, XivapiService } from '@xivapi/angular-client';
import { filter, map, shareReplay } from 'rxjs/operators';
import { Alarm } from '../../../core/alarms/alarm';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import * as _ from 'lodash';
import { uniqBy } from 'lodash';

@Component({
  selector: 'app-custom-alarm-popup',
  templateUrl: './custom-alarm-popup.component.html',
  styleUrls: ['./custom-alarm-popup.component.less']
})
export class CustomAlarmPopupComponent implements OnInit {

  form: FormGroup;

  /** Spawn are limited to hours (0 to 23) **/
  public SPAWN_VALIDATOR = {
    min: 0,
    max: 23
  };

  /** Duration is only limited to hours (0 to 23) **/
  public DURATION_VALIDATOR = {
    min: 0,
    max: 23
  };

  /** X is only limited from 0 to 99 **/
  public X_VALIDATOR = {
    min: 0,
    max: 99
  };

  /** Y is only limited from 0 to 99 **/
  public Y_VALIDATOR = {
    min: 0,
    max: 99
  };

  public maps$: Observable<any[]>;

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

  public spawn = null;

  public duration = 1;

  public weathers: number[] = [];

  public weathersFrom: number[] = [];

  public mapWeathers$: Observable<number[]>;

  constructor(private fb: FormBuilder, private xivapi: XivapiService, private alarmsFacade: AlarmsFacade,
              private modalRef: NzModalRef) {
    this.maps$ = this.xivapi.getList(XivapiEndpoint.Map, {
      columns: ['ID', 'PlaceNameTargetID', 'PlaceName.ID', 'TerritoryType.WeatherRate', 'PlaceNameSub'],
      max_items: 1000
    }).pipe(
      map(list => uniqBy(list.Results, 'PlaceNameTargetID')),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  submit(): void {
    const data = this.form.getRawValue();
    const alarm: Partial<Alarm> = {
      name: data.name
    };
    if (data.spawn !== null) {
      alarm.spawns = data.spawnsTwice ? [data.spawn, (data.spawn + 12) % 24] : [data.spawn];
      alarm.duration = data.duration;
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
      alarm.coords = { x: data.x || 0, y: data.y || 0, z: data.z || 0 };
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
      spawn: [this.spawn, [Validators.min(this.SPAWN_VALIDATOR.min), Validators.max(this.SPAWN_VALIDATOR.max)]],
      spawnsTwice: [this.spawnsTwice],
      duration: [this.duration, [Validators.min(this.DURATION_VALIDATOR.min), Validators.max(this.DURATION_VALIDATOR.max)]],
      type: [this.type, [Validators.min(0), Validators.max(4)]],
      mapId: [this.mapId, Validators.required],
      x: [this.x, [Validators.min(this.X_VALIDATOR.min), Validators.max(this.X_VALIDATOR.max)]],
      y: [this.y, [Validators.min(this.Y_VALIDATOR.min), Validators.max(this.Y_VALIDATOR.max)]],
      weathers: [this.weathers],
      weathersFrom: [this.weathersFrom]
    });

    this.mapWeathers$ = combineLatest([this.form.valueChanges, this.maps$]).pipe(
      map(([form, maps]) => {
        return maps.find(m => m.ID === form.mapId);
      }),
      filter(m => m !== undefined),
      map((m: { TerritoryType: { WeatherRate: number } }) => {
        return _.uniq(weatherIndex[m.TerritoryType.WeatherRate].map(row => +row.weatherId)) as number[];
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  public adjust(prop: string, amount: number): void {
    const oldValue = this.form.value[prop];
    const newValue = this.form.value[prop] + amount;

    this.form.patchValue({ [prop]: newValue });

    if (this.form.controls[prop].invalid) {
      this.form.patchValue({ [prop]: oldValue });
    }
  }
}
