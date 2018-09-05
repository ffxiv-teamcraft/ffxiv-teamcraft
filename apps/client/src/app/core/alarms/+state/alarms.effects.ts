import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';

@Injectable()
export class AlarmsEffects {

  constructor(private actions$: Actions) {
  }
}
