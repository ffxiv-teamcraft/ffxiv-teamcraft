import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import * as CommissionsActions from './commissions.actions';
import { exhaustMap, switchMap } from 'rxjs/operators';
import { AuthFacade } from '../../../+state/auth.facade';
import { CommissionService } from '../commission.service';

@Injectable()
export class CommissionsEffects {

  constructor(private actions$: Actions, private authFacade: AuthFacade,
              private commissionService: CommissionService) {
  }
}
