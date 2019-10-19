import { Observable } from 'rxjs';
import { ofPacketSubType } from '../rxjs/of-packet-subtype';
import { DataReporter } from './data-reporter';
import { MachinaService } from '../electron/machina.service';
import { delay, filter, map, withLatestFrom } from 'rxjs/operators';

export class ReductionResultReporter implements DataReporter {

  constructor(private machina: MachinaService) {
  }

  getDataReports(packets$: Observable<any>): Observable<any[]> {
    const reductionResults$ = packets$.pipe(
      ofPacketSubType('aetherReductionDlg')
    );

    const inventoryPatches$ = this.machina.inventoryPatches$.pipe(
      filter(patch => {
        return patch.quantity < 0 && patch.spiritBond && patch.spiritBond > 0;
      })
    );

    return reductionResults$.pipe(
      delay(500),
      withLatestFrom(inventoryPatches$),
      map(([packet, patch]) => {
        return packet.resultItems.map(item => {
          return {
            itemId: patch.itemId,
            purity: this.getPurity(patch.spiritBond),
            collectability: patch.spiritBond,
            resultItemId: item.itemId,
            resultItemQuantity: item.quantity,
            resultItemHQ: item.hq
          };
        });
      })
    );
  }

  getPurity(collectability: number): number {
    const purities = [300, 350, 400, 450, 500, 525, 550, 1000];
    return purities.filter(purity => purity <= collectability).length + 1;
  }

  getDataType(): string {
    return 'reductionresults';
  }
}
