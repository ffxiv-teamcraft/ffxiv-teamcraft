import { GarlandToolsService } from '../../../core/api/garland-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { I18nName } from '../../../model/common/i18n-name';
import { Ingredient } from '../../../model/garland-tools/ingredient';
import { MobNamePipe } from '../../../pipes/pipes/mob-name.pipe';
import { VenturesComponent } from '../../item-details/ventures/ventures.component';
import { DataType } from '../data/data-type';
import { CraftedBy } from '../model/crafted-by';
import { GatheredBy } from '../model/gathered-by';
import { Instance } from '../model/instance';
import { getItemSource, ListRow } from '../model/list-row';
import { StoredNode } from '../model/stored-node';
import { Vendor } from '../model/vendor';

interface NameHolder { name: string, itemIdName?: string }
interface ItemNameHolder { id: number | string, itemId?: string, name?: string, itemIdName?: string };
interface NPCNameHolder { id: number, npcId?: number, npcName?: string, zoneName?: string };
interface ZoneInfo { id?: number; npcId?: number; npcName?: string; zoneName?: string; zoneId?: any; zoneid?: any; mapId?: any; };
interface MapInfo { zoneId?: any; zoneid?: any; mapId?: any; };
interface CurrencyInfo { currencies: any[]; items: any[]; };
interface NpcTradeData { npcs: any; trades: CurrencyInfo[]; };
interface MonsterInfo { id: any; itemId?: any; position?: any; npcId?: number; npcName?: string; zoneName?: string; zoneId?: any; zoneid?: any; mapId?: any; };
interface MonsterInfoWithMobName extends MonsterInfo, NameHolder { }
interface VendorWithName extends Vendor, NameHolder { }
interface InstanceWithName extends Instance, NameHolder { }
interface GatherWithName extends GatheredBy, NameHolder { }

export class ListRowSerializationHelper {

  public static getData<T = any>(row: ListRow, type: DataType, isObject = false): T {
    return getItemSource<T>(row, type, isObject);
  }

  constructor(
    private i18nTools: I18nToolsService,
    private l12n: LocalizedDataService,
    private gt: GarlandToolsService,
  ) {
  }
  // guesses the name based off potential paths
  public applyItemName(obj: ItemNameHolder): ItemNameHolder {
    const id = obj.id ? obj.id : obj.itemId ? obj.itemId : undefined;
    return {
      ...obj,
      name: id ? this.getItemName(id) : undefined,
      itemIdName: obj.itemId ? this.getItemName(obj.itemId) : undefined
    };
  }

  private getItemName(id: any): string {
    const itemInfo = this.l12n.getItem(id);
    return id ? this.getNameIfExists(itemInfo) : undefined;
  }

  private serializeCraftedBy(craftedBy: any[]): any {
    return craftedBy ? craftedBy.map((obj: any) => {
      const retval = {
        ...obj,
        name: this.getItemName(obj.id),
        job: this.getJobAbbreviationFromId(obj.job)
      };
      return retval
    }) : undefined;
  }
  private getJobAbbreviationFromId(job: number): string {
    const jobAbbr = this.getNameIfExists(this.l12n.getJobAbbr(job));
    return jobAbbr != null && jobAbbr !== "missing name" ? jobAbbr : "DOWM";
  }

  private getNameIfExists(name: I18nName): string {
    const translatedName = this.i18nTools.getName(name);
    return translatedName && translatedName !== 'no name' ? translatedName : undefined;
  }

  private serializeVoyages(voyages: any): string {
    return voyages && voyages.length > 0 ? voyages.map((r: any) => this.getNameIfExists(r)) : undefined;
  }

  public applyNpcName(obj: Vendor): any {
    return {
      ...obj,
      npcName: this.getNameIfExists(this.l12n.getNpc(obj.npcId)),
      zoneName: this.getZoneName(obj),
    };
  }

  private getZoneName(obj: MapInfo): string {
    if (!obj)
      return undefined;
    ///wat.. casing!?
    const zoneName = this.l12n.getPlace(obj.zoneId ? obj.zoneId : obj.zoneid);
    const mapName = this.l12n.getMapName(obj.mapId);
    return this.getNameIfExists(zoneName ? zoneName : mapName);
  }

  public serializeTrades(trades: NpcTradeData[]): NpcTradeData[] {
    return trades && trades.length > 0 ? trades.map((r: any) => this.serializeTradeData(r)) : undefined;
  }

  public serializeTrade(obj: CurrencyInfo): CurrencyInfo {
    return {
      currencies: obj.currencies && obj.currencies.length > 0 ? obj.currencies.map(c => this.applyItemName(c)) : undefined,
      items: obj.items && obj.items.length > 0 ? obj.items.map(i => this.applyItemName(i)) : undefined,
    };
  }

  public serializeTradeData(obj: NpcTradeData): NpcTradeData {
    return {
      ...obj,
      npcs: this.serializeNPCs(obj.npcs),
      trades: obj.trades ? obj.trades.map(t => this.serializeTrade(t)) : undefined,
    };
  }

  public applyMonsterInfo(obj: MonsterInfo): MonsterInfoWithMobName {
    const id = obj.id ? obj.id : obj.itemId ? obj.itemId : undefined;
    const mobName = this.getMobNameFromId(id);
    const retval = {
      ...obj,
      name: this.getNameIfExists(mobName),
      zoneName: this.getZoneName(obj.position ? obj.position : obj),
    };
    return retval;
  }

  private getMobNameFromId(id: number): I18nName {
    return this.l12n.getMob(MobNamePipe.getActualMobId(id));
  }

  private getMonsterHuntData(monsterDrops: MonsterInfo[]): MonsterInfoWithMobName[] {
    return monsterDrops && monsterDrops.length > 0 ? monsterDrops.map((r: any) => this.applyMonsterInfo(r)) : undefined;
  }

  public serializeNPCs(vendors: Vendor[]): VendorWithName[] {
    return vendors && vendors.length > 0 ? vendors.map((r: Vendor) => this.applyNpcName(r)) : undefined;
  }

  private serializeVentures(item: ListRow, ventures: number[]) {
    return ventures && ventures.length > 0 ? this.gt.getVentures(ventures).map(venture => {
      const retval = {
        ...venture,
        ventureDetails: VenturesComponent.ventureAmounts(venture)
          .map(threshold => {
            return {
              ...threshold,
              venturesRemaining: Math.ceil((item.amount - item.done) / threshold.quantity)
            }
          }),
        name: this.getNameIfExists(this.l12n.getVenture(venture.id)),
        job: this.getJobAbbreviationFromId(venture.job),
      };
      delete retval.gathering;
      delete retval.amounts;
      delete retval.ilvl;
      delete retval.jobs;
      return retval;
    }) : undefined;
  }

  private applyIntanceName(instance: Instance): Instance {
    const retval = { ...instance }
    if (instance != null && !instance.name)
      retval.name = this.getNameIfExists(this.l12n.getInstanceName(instance.id))
    return retval;
  }

  private serializeInstances(instances: Instance[]): InstanceWithName[] {
    return instances && instances.length > 0 ? instances.map((r: Instance) => this.applyIntanceName(r)) : undefined;
  }

  private serializeReducedFrom(reducedFrom: ItemNameHolder[]): ItemNameHolder[] {
    return reducedFrom && reducedFrom.length > 0 ? reducedFrom.map((r: any) => this.applyItemName(r)) : undefined;
  }

  private serializeTreasures(treasures: ItemNameHolder[]): ItemNameHolder[] {
    return treasures && treasures.length > 0 ? treasures.map((r: any) => this.applyItemName(r)) : undefined;
  }

  private serializeMasterbooks(masterbooks: ItemNameHolder[]): ItemNameHolder[] {
    return masterbooks && masterbooks.length > 0 ? masterbooks.map((r: any) => this.applyItemName(r)) : undefined;
  }

  private serializeGardening(gardening: any) {
    if (!Number.isInteger(gardening))
      return undefined;
    return {
      ...this.applyItemName({ id: gardening }),
      url: `http://ffxivgardening.com/seed-details.php?SeedID=${gardening}`,
    };
  }

  private serializeRequires(item: ListRow): ItemNameHolder[] {
    return item.requires ? item.requires.map((r: Ingredient) => this.applyItemName(r)) : undefined;
  }

  private serializeGathering(gathering: GatheredBy): GatherWithName {
    const retval = gathering ? {
      ...gathering,
      //name: this.getJobAbbreviationFromId(LayoutOrderService.getJobIdFromGather(gathering.type)),
      //unclear what Id to use/convert to... 
      name: gathering.icon ? gathering.icon.substr(gathering.icon.lastIndexOf("/"), 3) : undefined,
      nodes: gathering.nodes ? gathering.nodes.map((n: StoredNode) => this.serializeGatheringNode(n)) : []
    } : undefined;
    return retval;
  }

  private serializeGatheringNode(n: StoredNode): any {
    return {
      ...n,
      limitType: n.limitType ? this.i18nTools.getName(n.limitType) : undefined,
      zoneName: this.getZoneName(n),
      coords: n.coords ? { x: n.coords[0], y: n.coords[1] } : undefined
    };
  }

  public getJsonExport(dc: string, server: string, rows: ListRow[], finalItems: ListRow[]): any {
    //convert all the desynth data into a single key value pair/dictionary (effectively dedupes for large dumps)
    const desynthMap = {}
    const desynthData = rows
      .map((item: ListRow) => {
        const desynths = ListRowSerializationHelper.getData(item, DataType.DESYNTHS);
        return desynths && desynths.length > 0 ? desynths.map((r: any) => this.applyItemName({ id: r })) : undefined
      })
      .filter(m => !!m)
      .reduce((pn, u) => [...pn, ...u], []);
    for (let i = 0; i < desynthData.length; i++) {
      desynthMap[desynthData[i].id] = desynthData[i].name;
    }
    const retval = {
      homeServer: server ? server : undefined,
      pricingURL: `https://universalis.app/api/${dc ? dc : '<DataCenter>'}/${rows.map(r => r.id).join(',')}`,
      items: rows
        .map(row => this.serializeDataRow(row)),
      desynthMap: desynthMap,
      finalItems: finalItems ? finalItems
        .map(row => this.serializeDataRow(row)) : undefined,
    };
    return retval;
  }

  private serializeDataRow(item: ListRow) {
    const craftedBy = ListRowSerializationHelper.getData<CraftedBy[]>(item, DataType.CRAFTED_BY);
    const trades = ListRowSerializationHelper.getData<NpcTradeData[]>(item, DataType.TRADE_SOURCES);
    const vendors = ListRowSerializationHelper.getData<Vendor[]>(item, DataType.VENDORS);
    const reducedFrom = ListRowSerializationHelper.getData(item, DataType.REDUCED_FROM);
    const desynths = ListRowSerializationHelper.getData<number[]>(item, DataType.DESYNTHS);
    const instances = ListRowSerializationHelper.getData<Instance[]>(item, DataType.INSTANCES);
    const gathering = ListRowSerializationHelper.getData<GatheredBy>(item, DataType.GATHERED_BY);
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
    const name = this.getItemName(item.id);
    const retval: any = {
      ...this.applyItemName(item),
      done: item.done ? true : false,
      amountNeeded: item.amount_needed,
      used: item.used,
      requires: this.serializeRequires(item),
      neededToCraft: this.serializeCraftedBy(craftedBy),
      trades: this.serializeTrades(trades),
      vendors: this.serializeNPCs(vendors),
      reducedFrom: this.serializeReducedFrom(reducedFrom),
      desynths: desynths,
      instances: this.serializeInstances(instances),
      gathering: this.serializeGathering(gathering),
      gardening: this.serializeGardening(gardening),
      voyages: this.serializeVoyages(voyages),
      hunting: this.getMonsterHuntData(monsterDrops),
      masterbooks: this.serializeMasterbooks(masterbooks),
      treasures: this.serializeTreasures(treasures),
      fates: this.serializeFates(fates),
      ventures: this.serializeVentures(item, ventures),
      tripleTriadDuels: this.serializeTriadDuels(tripleTriadDuels),
      tripleTriadPack: this.serializeTripleTriadPack(tripleTriadPack),
      quests: this.serializeQuests(quests),
      achievements: this.serializeAchievements(achievements),
      marketBoardLink: `https://universalis.app/market/${item.id}`,
    };
    //get rid of fields that are confusing for an export layer
    delete retval.sources;
    delete retval.craftedBy;
    delete retval.amount_needed;
    return retval;
  }

  private serializeAchievements(achievements: any) {
    return achievements && achievements.length > 0 ? achievements.map((r: any) => this.applyItemName(r)) : undefined;
  }

  private serializeQuests(quests: any) {
    return quests && quests.length > 0 ? quests.map((r: any) => this.applyItemName(r)) : undefined;
  }

  private serializeTripleTriadPack(tripleTriadPack: any) {
    return tripleTriadPack && tripleTriadPack.length > 0 ? tripleTriadPack.map((r: any) => this.applyItemName(r)) : undefined;
  }

  private serializeTriadDuels(tripleTriadDuels: any) {
    return tripleTriadDuels && tripleTriadDuels.length > 0 ? tripleTriadDuels.map((r: any) => this.applyItemName(r)) : undefined;
  }

  private serializeFates(fates: any) {
    return fates && fates.length > 0 ? fates.map((r: any) => this.applyItemName(r)) : undefined;
  }

}