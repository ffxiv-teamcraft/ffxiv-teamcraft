import { GatheredByExtractor } from './gathered-by.extractor';
import { AlarmDetails, DataType, GatheringNode } from '@ffxiv-teamcraft/types';

export class AlarmsExtractor extends GatheredByExtractor<AlarmDetails[]> {

  private itemPatch = this.requireLazyFile('itemPatch');

  private legendaryFish = this.requireLazyFile('legendaryFish');

  doExtract(itemId: number): any {
    const nodes = this.getItemNodes(itemId);
    return nodes.map(node => {
      return node.limited ? this.generateAlarms(node) : [];
    }).flat();
  }

  public generateAlarms(node: GatheringNode): AlarmDetails[] {
    // If no spawns and no weather, no alarms.
    if (!node?.spawns?.length && !node?.weathers?.length) {
      return [];
    }
    const alarm: AlarmDetails = {
      itemId: node.matchingItemId,
      nodeId: node.id,
      duration: node.duration ? node.duration / 60 : 0,
      mapId: node.map,
      zoneId: node.zoneId,
      areaId: node.zoneId,
      type: node.type,
      coords: {
        x: node.x,
        y: node.y,
        z: node.z || 0
      },
      spawns: node.spawns,
      folklore: node?.folklore,
      reduction: node.isReduction || false,
      ephemeral: node.ephemeral || false,
      nodeContent: node.items,
      weathers: node.weathers || [],
      weathersFrom: node.weathersFrom || [],
      snagging: node.snagging || false,
      predators: node.predators || []
    };
    if (node.speed) {
      alarm.speed = node.speed;
      alarm.shadowSize = node.shadowSize;
    }
    if (node.baits) {
      alarm.baits = node.baits;
    }
    if (node.hookset) {
      alarm.hookset = node.hookset;
    }
    return this.applyFishEyes(alarm) as AlarmDetails[];
  }

  private applyFishEyes(alarm: AlarmDetails): AlarmDetails[] {
    const patch = this.itemPatch && this.itemPatch[alarm.itemId];
    const expansion = this.xivapiPatches.find(p => p.ID === patch)?.ExVersion;
    const isLegendary = this.legendaryFish && this.legendaryFish[alarm.itemId];
    // The changes only apply to fishes pre-ShB and non-legendary
    if (expansion < 3 && alarm.weathers?.length > 0 && alarm.spawns && !isLegendary) {
      const { spawns, ...alarmWithFishEyesEnabled } = alarm;
      return [alarm, { ...alarmWithFishEyesEnabled, fishEyes: true, spawns: [] }];
    }
    return [alarm];
  }

  getDataType(): DataType {
    return DataType.ALARMS;
  }
}
