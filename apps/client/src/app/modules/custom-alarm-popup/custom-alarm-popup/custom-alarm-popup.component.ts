import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { PersistedAlarm } from '../../../core/alarms/persisted-alarm';
import { AlarmsFacade } from '../../../core/alarms/+state/alarms.facade';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { weatherIndex } from '../../../core/data/sources/weather-index';
import * as _ from 'lodash';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { MapNamePipe } from '../../../pipes/pipes/map-name.pipe';
import { NodeTypeNamePipe } from '../../../pipes/pipes/node-type-name';
import { I18nRowPipe } from '../../../core/i18n/i18n-row.pipe';
import { I18nPipe } from '../../../core/i18n.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { MouseWheelDirective } from '../../../core/event/mouse-wheel/mouse-wheel.directive';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
    selector: 'app-custom-alarm-popup',
    templateUrl: './custom-alarm-popup.component.html',
    styleUrls: ['./custom-alarm-popup.component.less'],
    standalone: true,
    imports: [FormsModule, NzFormModule, ReactiveFormsModule, NzGridModule, NzInputModule, NzButtonModule, NzInputNumberModule, MouseWheelDirective, NzCheckboxModule, NzToolTipModule, NzSelectModule, NgIf, NgFor, NzSpinModule, NzWaveModule, AsyncPipe, TranslateModule, I18nPipe, I18nRowPipe, NodeTypeNamePipe, MapNamePipe]
})
export class CustomAlarmPopupComponent implements OnInit {

  form: UntypedFormGroup;

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

  public maps$ = this.lazyData.getEntry('mapEntries');

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

  constructor(private fb: UntypedFormBuilder, private lazyData: LazyDataFacade, private alarmsFacade: AlarmsFacade,
              private modalRef: NzModalRef) {
  }

  submit(): void {
    const data = this.form.getRawValue();
    const alarm: Partial<PersistedAlarm> = {
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
      this.modalRef.close(<PersistedAlarm>alarm);
    } else {
      this.alarmsFacade.addAlarms(<PersistedAlarm>alarm);
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
    }, {
      validators: (control: AbstractControl) => {
        const spawn = control.value.spawn;
        const weather = (control.value.weathers && control.value.weathers.length > 0);
        if (spawn || weather) {
          return null;
        }

        return {
          spawn: true,
          weathers: true
        };
      }
    });

    this.mapWeathers$ = combineLatest([this.form.valueChanges, this.maps$]).pipe(
      map(([form, maps]) => {
        return maps.find(m => m.id === form.mapId);
      }),
      filter(m => m !== undefined),
      map((m) => {
        const defaultWeather = weatherIndex[m.weatherRate];
        if (defaultWeather != undefined) {
          return _.uniq(defaultWeather.map(row => +row.weatherId)) as number[];
        }
      }),
      startWith([]),
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
