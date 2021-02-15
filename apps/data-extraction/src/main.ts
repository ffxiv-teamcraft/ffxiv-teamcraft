import { concat, of } from 'rxjs';
import { AbstractExtractor } from './abstract-extractor';
import { MapIdsExtractor } from './extractors/map-ids.extractor';
import { SingleBar } from 'cli-progress';
import { MappyExtractor } from './extractors/mappy.extractor';
import { switchMapTo, tap } from 'rxjs/operators';
import { LogsExtractor } from './extractors/logs.extractor';
import { FishParameterExtractor } from './extractors/fish-parameter.extractor';
import { WeatherRateExtractor } from './extractors/weather-rate.extractor';
import { WeathersExtractor } from './extractors/weathers.extractor';
import { AetherstreamExtractor } from './extractors/aetherstream.extractor';
import { I18nExtractor } from './i18n.extractor';
import { MapsExtractor } from './extractors/maps.extractor';
import { QuestsExtractor } from './extractors/quests.extractor';
import { LgbExtractor } from './extractors/lgb.extractor';
import { InstancesExtractor } from './extractors/instances.extractor';
import { NpcsExtractor } from './extractors/npcs.extractor';
import { LevesExtractor } from './extractors/leves.extractor';
import { JobsExtractor } from './extractors/jobs.extractor';
import { JobCategoriesExtractor } from './extractors/job-categories.extractor';
import { FatesExtractor } from './extractors/fates.extractor';
import { HuntsExtractor } from './extractors/hunts.extractor';
import { GatheringBonusesExtractor } from './extractors/gathering-bonuses.extractor';
import { CdGroupsExtractor } from './extractors/cd-groups.extractor';
import { CombosExtractor } from './extractors/combos.extractor';
import { ItemsExtractor } from './extractors/items.extractor';
import { AetherytesExtractor } from './extractors/aetherytes.extractor';
import { RecipesExtractor } from './extractors/recipes.extractor';
import { ActionsExtractor } from './extractors/actions.extractor';
import { ReductionsExtractor } from './extractors/reductions.extractor';
import { MonsterDropsExtractor } from './extractors/monster-drops.extractor';
import { StatsExtractor } from './extractors/stats.extractor';
import { PatchContentExtractor } from './extractors/patch-content.extractor';
import { WorldsExtractor } from './extractors/worlds.extractor';
import { TerritoriesExtractor } from './extractors/territories.extractor';
import { CollectablesExtractor } from './extractors/collectables.extractor';
import { CollectablesShopsExtractor } from './extractors/collectables-shops.extractor';
import { HwdGathererExtractor } from './extractors/hwd-gatherer.extractor';
import { ActionTimelineExtractor } from './extractors/action-timeline.extractor';
import { MateriasExtractor } from './extractors/materias.extractor';
import { BaseParamExtractor } from './extractors/base-param.extractor';
import { ItemLevelExtractor } from './extractors/item-level.extractor';
import { ClassJobModifiersExtractor } from './extractors/class-job-modifiers.extractor';
import { EquipSlotCategoryExtractor } from './extractors/equip-slot-category.extractor';
import { TribesExtractor } from './extractors/tribes.extractor';
import { VenturesExtractor } from './extractors/ventures.extractor';
import { FoodsExtractor } from './extractors/foods.extractor';
import { MedicinesExtractor } from './extractors/medicines.extractor';
import { ParamGrowExtractor } from './extractors/param-grow.extractor';
import { GubalExtractor } from './extractors/gubal.extractor';
import { SubmarinePartsExtractor } from './extractors/submarine-parts.extractor';
import { SubmarineRanksExtractor } from './extractors/submarine-ranks.extractor';
import { AirshipPartsExtractor } from './extractors/airship-parts.extractor';
import { AirshipRanksExtractor } from './extractors/airship-ranks.extractor';

// We have to do it like that because the lib seems to dynamically import its prompts,
// which creates shitty typings
const { MultiSelect } = require('enquirer');

const extractors: AbstractExtractor[] = [
  new I18nExtractor('BNpcName', 'mobs'),
  new I18nExtractor('PlaceName', 'places'),
  new I18nExtractor('Status', 'statuses', { Icon: 'icon' }),
  new I18nExtractor('ItemSeries', 'item-series', { 'GameContentLinks.Item.ItemSeries': 'items' }),
  new I18nExtractor('Achievement', 'achievements', { Icon: 'icon' }),
  new I18nExtractor('CollectablesShopItemGroup', 'collectables-shop-item-group'),
  new I18nExtractor('HWDGathereInspectTerm', 'hwd-phases'),
  new I18nExtractor('Race', 'races'),
  new I18nExtractor('SpecialShop', 'shops'),
  new I18nExtractor('AirshipExplorationPoint', 'airship-voyages', { ID: 'id' }, 'NameShort_'),
  new I18nExtractor('SubmarineExploration', 'submarine-voyages', { ID: 'id' }, 'Destination_'),
  new WorldsExtractor(),
  new TerritoriesExtractor(),
  new CollectablesExtractor(),
  new HwdGathererExtractor(),
  new ActionTimelineExtractor(),
  new MateriasExtractor(),
  new BaseParamExtractor(),
  new ItemLevelExtractor(),
  new ClassJobModifiersExtractor(),
  new EquipSlotCategoryExtractor(),
  new TribesExtractor(),
  new VenturesExtractor(),
  new FoodsExtractor(),
  new MedicinesExtractor(),
  new ParamGrowExtractor(),
  new CollectablesShopsExtractor(),
  new NpcsExtractor(),
  new LevesExtractor(),
  new JobsExtractor(),
  new JobCategoriesExtractor(),
  new FatesExtractor(),
  new GatheringBonusesExtractor(),
  new CdGroupsExtractor(),
  new CombosExtractor(),
  new ItemsExtractor(),
  new AetherytesExtractor(),
  new RecipesExtractor(),
  new ActionsExtractor(),
  new ReductionsExtractor(),
  new MonsterDropsExtractor(),
  new StatsExtractor(),
  new InstancesExtractor(),
  new QuestsExtractor(),
  new MapsExtractor(),
  new MapIdsExtractor(),
  new FishParameterExtractor(),
  new AetherstreamExtractor(),
  new WeathersExtractor(),
  new WeatherRateExtractor(),
  new PatchContentExtractor(),
  new LogsExtractor(),
  new MappyExtractor(),
  new LgbExtractor(),
  new GubalExtractor(),
  new SubmarinePartsExtractor(),
  new SubmarineRanksExtractor(),
  new AirshipPartsExtractor(),
  new AirshipRanksExtractor(),
];

if (process.env.XIVAPI_KEY) {
  console.log('Fast mode enabled');
}

const operationsSelection = new MultiSelect({
  name: 'operations',
  message: 'What should be extracted ?',
  choices: [
    'everything',
    ...extractors.map(extractor => {
      return extractor.getName();
    }),
  ]
});

operationsSelection.run().then((selection: string[]) => {
  const selectedExtractors = extractors.filter(e => {
    return selection.includes('everything') || selection.includes(e.getName());
  });

  const progress = new SingleBar({
    format: ' {bar} | {label} | {requests} requests done | {value}/{total}',
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    stopOnComplete: true
  });

  progress.start(selectedExtractors.length, 0);

  concat(...selectedExtractors.map(extractor => {
    return of(null).pipe(
      tap(() => {
        progress.update({
          label: extractor.getName()
        });
      }),
      switchMapTo(extractor.extract(progress))
    );
  })).subscribe({
    next: () => {
      progress.increment();
    },
    complete: () => {
      progress.stop();
      process.exit(0);
    }
  });
});
