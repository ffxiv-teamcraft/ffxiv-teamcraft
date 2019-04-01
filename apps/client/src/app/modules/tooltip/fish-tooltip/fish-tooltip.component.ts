import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { spearFishingLog } from '../../../core/data/sources/spear-fishing-log';
import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { spearFishingNodes } from '../../../core/data/sources/spear-fishing-nodes';

@Component({
  selector: 'app-fish-tooltip-component',
  templateUrl: './fish-tooltip.component.html',
  styleUrls: ['./fish-tooltip.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FishTooltipComponent {

  @Input() fish: any;

  constructor(private gt: GarlandToolsService, private l12n: LocalizedDataService) {
  }

  public getFshData(fish: any): any[] {
    const spots = this.gt.getFishingSpots(fish.ID);
    if (fish.id >= 20000) {
      const nodes = spearFishingNodes.filter(node => node.itemId === fish.ID);
      const logEntries = [].concat.apply([], nodes.map(node => spearFishingLog.filter(entry => entry.itemId === node.id)));
      return logEntries.map(entry => {
        return {
          zoneid: entry.zoneId,
          mapId: entry.mapId,
          x: entry.coords.x,
          y: entry.coords.y,
          level: entry.level,
          type: 4,
          itemId: fish.ID,
          icon: fish.Icon,
          timed: false
        };
      });
    } else {
      if (spots.length > 0) {
        return spots.map(spot => {
          const mapId = this.l12n.getMapId(spot.zone);
          const zoneId = this.l12n.getAreaIdByENName(spot.title);
          if (mapId !== undefined) {
            const result: any = {
              zoneid: zoneId,
              mapId: mapId,
              x: spot.coords[0],
              y: spot.coords[1],
              level: spot.lvl,
              type: 4,
              itemId: spot.id,
              icon: spot.icon,
              timed: spot.during !== undefined,
              fishEyes: spot.fishEyes,
              snagging: spot.snagging
            };
            if (spot.during !== undefined) {
              result.spawnTimes = [spot.during.start];
              result.uptime = spot.during.end - spot.during.start;
              // Just in case it despawns the day after.
              result.uptime = result.uptime < 0 ? result.uptime + 24 : result.uptime;
              // As uptimes are always in minutes, gotta convert to minutes here too.
              result.uptime *= 60;
            }

            if (spot.predator) {
              result.predators = spot.predator.map(predator => {
                return {
                  id: predator.id,
                  icon: predator.icon,
                  predatorAmount: predator.amount
                };
              });
            }

            result.baits = spot.bait.map(bait => {
              const baitData = this.gt.getBait(bait);
              return {
                icon: baitData.icon,
                id: baitData.id
              };
            });
            if (spot.weather) {
              result.weathers = spot.weather.map(w => this.l12n.getWeatherId(w));
            }
            return result;
          }
          return undefined;
        })
          .filter(res => res !== undefined)
          .slice(0, 3);
      }
    }
    return null;
  }

  public getNodeSpawns(node: any): string {
    if (node.spawnTimes === undefined || node.spawnTimes.length === 0) {
      return '';
    }
    return node.spawnTimes.reduce((res, current) => `${res}${current}:00 - ${(current + node.uptime / 60) % 24}:00, `, ``).slice(0, -2);
  }
}
