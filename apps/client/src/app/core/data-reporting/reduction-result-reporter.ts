import { Observable } from 'rxjs';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { DataReporter } from './data-reporter';
import { MachinaService } from '../electron/machina.service';
import { delay, filter, map, tap, withLatestFrom } from 'rxjs/operators';

export class ReductionResultReporter implements DataReporter {

  constructor(private machina: MachinaService) {
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const reductionResults = packets$.pipe(
      ofPacketSubType('aetherReductionDlg')
    );

    const inventoryPatches = this.machina.inventoryPatches$.pipe(
      filter(patch => {
        return patch.spiritBond && patch.spiritBond > 0;
      })
    );

    return reductionResults.pipe(
      delay(500),
      withLatestFrom(inventoryPatches),
      map(([packet, patch]) => {
        return packet.resultItems.map(item => {
          return {
            itemId: patch.itemId,
            collectability: patch.spiritBond,
            resultItemId: item.itemId,
            resultItemQuantity: item.quantity
          };
        });
      })
    );
  }

  getDataType(): string {
    return 'reductionresults';
  }
}
