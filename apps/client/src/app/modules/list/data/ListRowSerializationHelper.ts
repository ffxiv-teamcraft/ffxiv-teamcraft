import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { I18nName } from '../../../model/common/i18n-name';
import { VenturesComponent } from '../../item-details/ventures/ventures.component';
import { DataType } from '../data/data-type';
import { getItemSource, ListRow } from '../model/list-row';

export class ListRowSerializationHelper {
  constructor(
    private i18nTools: I18nToolsService,
    private l12n: LocalizedDataService,
    private gt: GarlandToolsService,
  ) {

  }
  public applyItemName(obj) {
    const id = obj.id ? obj.id : obj.itemId ? obj.itemId : undefined;
    return {
      ...obj,
      name: this.getItemName(id),
      itemId: this.getItemName(obj.itemId)
    };
  }

  private getItemName(id: any) {
    const itemInfo = this.l12n.getItem(id);
    return id ? this.getNameIfExists(itemInfo) : undefined;
  }

  private serializeCraftedBy(craftedBy: any) {
    return craftedBy ? craftedBy.map((obj: any) => {
      const retval = {
        ...obj,
        name: this.getItemName(obj.id),
        job: this.getJob(obj.job)
      };
      return retval
    }) : undefined;
  }
  private getJob(job: any) {
    return this.getNameIfExists(this.l12n.getJobAbbr(job));
  }

  private getNameIfExists(itemName: I18nName) {
    const name = this.i18nTools.getName(itemName);
    return name && name != 'no name' ? name : undefined;
  }

  private serializeVoyages(voyages: any) {
    return voyages && voyages.length > 0 ? voyages.map((r: any) => this.getNameIfExists(r)) : undefined;
  }

  public applyNpcName(obj) {
    return {
      ...obj,
      npcName: this.getNameIfExists(this.l12n.getNpc(obj.npcId ? obj.npcId : obj.id)),
      zoneName: this.getNameIfExists(this.l12n.getPlace(obj.zoneId) ? this.l12n.getPlace(obj.zoneId) : this.l12n.getMapName(obj.mapId)),
    };
  }

  public serializeTrades(trades: any) {
    return trades && trades.length > 0 ? trades.map((r: any) => this.serializeTradeData(r)) : undefined;
  }

  public serializeTrade(obj) {
    return {
      currencies: obj.currencies && obj.currencies.length > 0 ? obj.currencies.map(c => this.applyItemName(c)) : undefined,
      items: obj.items && obj.items.length > 0 ? obj.items.map(i => this.applyItemName(i)) : undefined,
    };
  }

  public serializeTradeData(obj) {
    return {
      ...obj,
      npcs: this.serializeNPCs(obj.npcs),
      trades: this.serializeTrade(obj.trades),
    };
  }

  private getMonsterHuntData(monsterDrops: any) {
    return monsterDrops && monsterDrops.length > 0 ? monsterDrops.map((r: any) => this.applyItemName(r)) : undefined;
  }

  public serializeNPCs(vendors: any) {
    return vendors && vendors.length > 0 ? vendors.map((r: any) => this.applyNpcName(r)) : undefined;
  }

  private serializeVentures(item: any, ventures: any) {
    return ventures && ventures.length > 0 ? this.gt.getVentures(ventures).map(venture => {
      let retval = {
        ...venture,
        amountsDetails: VenturesComponent.ventureAmounts(venture)
          .map(threshold => {
            return {
              ...threshold,
              venturesRemaining: Math.ceil((item.amount - item.done) / threshold.quantity)
            }
          }),
        name: this.getNameIfExists(this.l12n.getVenture(venture.id)),
        job: this.getJob(venture.job),
      };
      delete retval.gathering;
      delete retval.amounts;
      delete retval.ilvl;
      delete retval.jobs;
      return retval;
    }) : undefined;
  }

  public static getData<T = any>(row: ListRow, type: DataType, isObject = false): T {
    return getItemSource<T>(row, type, isObject);
  }

  public getJsonExport(dc: string, server: string, rows: ListRow[]): any {
    //convert all the desynth data into a single key value pair/dictionary (effectively dedupes for large dumps)
    let desynthMap = {}
    const desynthData = rows
      .map((item: ListRow) => {
        const desynths = ListRowSerializationHelper.getData(item, DataType.DESYNTHS);
        return desynths && desynths.length > 0 ? desynths.map((r: any) => this.applyItemName({ id: r })) : undefined
      })
      .filter(m => !!m)
      .reduce((pn, u) => [...pn, ...u], []);
    for (var i = 0; i < desynthData.length; i++) {
      desynthMap[desynthData[i].id] = desynthData[i].name;
    }

    return {
      homeServer: server ? server : undefined,
      pricingURL: `https://universalis.app/api/${dc ? dc : '<DataCenter>'}/${rows.map(r => r.id).join(',')}`,
      items: rows
        .map(row => this.applyItemName(row))
        .map((item: ListRow) => {
          const craftedBy = ListRowSerializationHelper.getData(item, DataType.CRAFTED_BY);
          const trades = ListRowSerializationHelper.getData(item, DataType.TRADE_SOURCES);
          const vendors = ListRowSerializationHelper.getData(item, DataType.VENDORS);
          const reducedFrom = ListRowSerializationHelper.getData(item, DataType.REDUCED_FROM);
          const desynths = ListRowSerializationHelper.getData(item, DataType.DESYNTHS);
          const instances = ListRowSerializationHelper.getData(item, DataType.INSTANCES);
          const gathering = ListRowSerializationHelper.getData(item, DataType.GATHERED_BY);
          const gardening = ListRowSerializationHelper.getData(item, DataType.GARDENING);
          const voyages = ListRowSerializationHelper.getData(item, DataType.VOYAGES);
          const monsterDrops = ListRowSerializationHelper.getData(item, DataType.DROPS);
          const masterbooks = ListRowSerializationHelper.getData(item, DataType.MASTERBOOKS);
          const treasures = ListRowSerializationHelper.getData(item, DataType.TREASURES);
          const fates = ListRowSerializationHelper.getData(item, DataType.FATES);
          const ventures = ListRowSerializationHelper.getData(item, DataType.VENTURES);
          const tripleTriadDuels = ListRowSerializationHelper.getData(item, DataType.TRIPLE_TRIAD_DUELS);
          const tripleTriadPack = ListRowSerializationHelper.getData(item, DataType.TRIPLE_TRIAD_PACK);
          const quests = ListRowSerializationHelper.getData(item, DataType.QUESTS);
          const achievements = ListRowSerializationHelper.getData(item, DataType.ACHIEVEMENTS);
          let retval: any = {
            ...item,
            done: item.done ? true : false,
            amountNeeded: item.amount_needed,
            used: item.used,
            requires: item.requires ? item.requires.map((r: any) => this.applyItemName(r)) : undefined,
            neededToCraft: this.serializeCraftedBy(craftedBy),
            trades: this.serializeTrades(trades),
            vendors: this.serializeNPCs(vendors),
            reducedFrom: reducedFrom && reducedFrom.length > 0 ? reducedFrom.map((r: any) => this.applyItemName(r)) : undefined,
            desynths: desynths,
            instances: instances && instances.length > 0 ? instances.map((r: any) => this.applyItemName(r)) : undefined,
            gathering: gathering && gathering.length > 0 ? gathering.map((r: any) => this.applyItemName(r)) : undefined,
            gardening: gardening && gardening.length > 0 ? gardening.map((r: any) => this.applyItemName(r)) : undefined,
            voyages: this.serializeVoyages(voyages),
            hunting: this.getMonsterHuntData(monsterDrops),
            masterbooks: masterbooks && masterbooks.length > 0 ? masterbooks.map((r: any) => this.applyItemName(r)) : undefined,
            treasures: treasures && treasures.length > 0 ? treasures.map((r: any) => this.applyItemName(r)) : undefined,
            fates: fates && fates.length > 0 ? fates.map((r: any) => this.applyItemName(r)) : undefined,
            ventures: this.serializeVentures(item, ventures),
            tripleTriadDuels: tripleTriadDuels && tripleTriadDuels.length > 0 ? tripleTriadDuels.map((r: any) => this.applyItemName(r)) : undefined,
            tripleTriadPack: tripleTriadPack && tripleTriadPack.length > 0 ? tripleTriadPack.map((r: any) => this.applyItemName(r)) : undefined,
            quests: quests && quests.length > 0 ? quests.map((r: any) => this.applyItemName(r)) : undefined,
            achievements: achievements && achievements.length > 0 ? achievements.map((r: any) => this.applyItemName(r)) : undefined,
            marketBoardLink: `https://universalis.app/market/${item.id}`,
          };
          //get rid of fields that are confusing for an export layer
          delete retval.sources;
          delete retval.craftedBy;
          return retval;
        }),
      desynthMap: desynthMap,
    };
  }
}