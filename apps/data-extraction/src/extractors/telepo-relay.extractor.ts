import { XivDataService } from '../xiv/xiv-data.service';
import { AbstractExtractor } from '../abstract-extractor';
import { combineLatest } from 'rxjs';

export class TelepoRelayExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): any {
    const telepoRelays = {};
    const territoryTypeTelepoRelays = {};
    combineLatest([
      this.getSheet<any>(xiv, 'TelepoRelay', ['*'], true, 2),
      this.getSheet<any>(xiv, 'TerritoryTypeTelepo', ['*'], true, 2)
    ]).subscribe(([telepoRelay, territoryTelepoRelay]) => {
      telepoRelay.forEach(entry => {
        telepoRelays[entry.index] = entry.Relays.map(relay => {
          return {
            enter: relay.EnterTerritory.index,
            exit: relay.ExitTerritory.index,
            cost: relay.Cost
          }
        });
      });
      territoryTelepoRelay.forEach(entry => {
        territoryTypeTelepoRelays[entry.index] = {
          relay: entry.Relay.index,
          x: entry.X,
          y: entry.Y,
          ex: entry.Expansion
        };
      });
      this.persistToJsonAsset('telepo-relay', telepoRelays);
      this.persistToJsonAsset('territory-type-telepo-relay', territoryTypeTelepoRelays);
      this.done();
    });
  }

  getName(): string {
    return 'telepo-relay';
  }

}
