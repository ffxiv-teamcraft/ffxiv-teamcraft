import { Injectable } from '@angular/core';
import { BonusType } from './consumable-bonus';
import { FreeCompanyAction } from './free-company-action';
import { FreeCompanyActionDataRow } from './free-company-action-data-row';

@Injectable()
export class FreeCompanyActionsService {

  fromData(data: FreeCompanyActionDataRow[]): FreeCompanyAction[] {
    return data.map(row => {
      return new FreeCompanyAction(row.actionId, <BonusType>row.bonusType, row.value);
    });
  }
}
