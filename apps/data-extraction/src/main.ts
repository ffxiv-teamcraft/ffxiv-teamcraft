import { AbstractExtractor } from './abstract-extractor';
import { MapIdsExtractor } from './extractors/map-ids.extractor';
import { MultiBar } from 'cli-progress';
import { MappyExtractor } from './extractors/mappy.extractor';
import { LogsExtractor } from './extractors/logs.extractor';
import { FishParameterExtractor } from './extractors/fish-parameter.extractor';
import { WeatherRateExtractor } from './extractors/weather-rate.extractor';
import { WeathersExtractor } from './extractors/weathers.extractor';
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
import { ConsumablesExtractor } from './extractors/consumables.extractor';
import { ParamGrowExtractor } from './extractors/param-grow.extractor';
import { GubalExtractor } from './extractors/gubal.extractor';
import { SubmarinePartsExtractor } from './extractors/submarine-parts.extractor';
import { SubmarineRanksExtractor } from './extractors/submarine-ranks.extractor';
import { AirshipPartsExtractor } from './extractors/airship-parts.extractor';
import { AirshipRanksExtractor } from './extractors/airship-ranks.extractor';
import { TreasuresExtractor } from './extractors/treasures.extractor';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { AllaganReportsExtractor } from './extractors/allagan-reports.extractor';
import { NodesExtractor } from './extractors/nodes.extractor';
import { GatheringSearchIndexExtractor } from './extractors/gathering-search-index.extractor';
import { IslandExtractor } from './extractors/island.extractor';
import { TraitsExtractor } from './extractors/traits.extractor';
import { KoboldService } from './kobold/kobold.service';
import { XivDataService } from './xiv/xiv-data.service';
import { from, mergeMap, tap } from 'rxjs';
import { ItemSeriesExtractor } from './extractors/item-series.extractor';
import { ShopsExtractor } from './extractors/shops.extractor';
import { SeedsExtractor } from './extractors/seeds.extractor';
import { ItemDetailsExtractExtractor } from './extractors/item-details-extract.extractor';

const argv = yargs(hideBin(process.argv)).argv;

// We have to do it like that because the lib seems to dynamically import its prompts,
// which creates shitty typings
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MultiSelect } = require('enquirer');

const extractors: AbstractExtractor[] = [
  new I18nExtractor('BNpcName', 'mobs', 'Singular_'),
  new I18nExtractor('Title', 'titles', 'Masculine_', {}),
  new I18nExtractor('PlaceName', 'places', 'Name_', {}, false, (row, entities) => {
    if (row.ID === 4043) {
      const realName = entities[2566];
      return {
        ...row,
        Name_en: realName.en,
        Name_de: realName.de,
        Name_ja: realName.ja,
        Name_fr: realName.fr
      };
    }
    return row;
  }),
  new I18nExtractor('Status', 'statuses', 'Name_', { Icon: 'icon' }),
  new I18nExtractor('Achievement', 'achievements', 'Name_', { Icon: 'icon', Item: 'itemReward' }),
  new I18nExtractor('CollectablesShopItemGroup', 'collectables-shop-item-group'),
  new I18nExtractor('HWDGathereInspectTerm', 'hwd-phases'),
  new I18nExtractor('Race', 'races', 'Masculine_'),
  new I18nExtractor('SpecialShop', 'special-shop-names'),
  new I18nExtractor('GilShop', 'gil-shop-names'),
  new I18nExtractor('TopicSelect', 'topic-select-names'),
  new I18nExtractor('GrandCompany', 'gc-names'),
  new I18nExtractor('AirshipExplorationPoint', 'airship-voyages', 'NameShort_', { index: 'id' }, true),
  new I18nExtractor('SubmarineExploration', 'submarine-voyages', 'Destination_', { index: 'id', Location_ja: 'location' }),
  new I18nExtractor('MJICraftworksObjectTheme', 'island-craftworks-theme'),
  new ItemSeriesExtractor(),
  new TraitsExtractor(),
  new WorldsExtractor(),
  new TerritoriesExtractor(),
  new ItemsExtractor(),
  new ItemLevelExtractor(),
  new BaseParamExtractor(),
  new MateriasExtractor(),
  new EquipSlotCategoryExtractor(),
  new TribesExtractor(),
  new ClassJobModifiersExtractor(),
  new VenturesExtractor(),
  new StatsExtractor(),
  new ShopsExtractor(),
  new IslandExtractor(),
  new HwdGathererExtractor(),
  new ActionTimelineExtractor(),
  new ParamGrowExtractor(),
  new CollectablesShopsExtractor(),
  new NpcsExtractor(),
  new LevesExtractor(),
  new JobsExtractor(),
  new JobCategoriesExtractor(),
  new FatesExtractor(),
  new CdGroupsExtractor(),
  new CombosExtractor(),
  new AetherytesExtractor(),
  new ActionsExtractor(),
  new InstancesExtractor(),
  new WeathersExtractor(),
  new MapsExtractor(),
  new LogsExtractor(),
  new FishParameterExtractor(),
  new MapIdsExtractor(),
  new TreasuresExtractor(),
  new ConsumablesExtractor(),
  new NodesExtractor(),
  new WeatherRateExtractor(),
  new GatheringBonusesExtractor(),
  new CollectablesExtractor(),
  new RecipesExtractor(),
  new QuestsExtractor(),
  new SubmarinePartsExtractor(),
  new AirshipPartsExtractor(),
  new SubmarineRanksExtractor(),
  new AirshipRanksExtractor(),
  new SeedsExtractor(),
  new ReductionsExtractor(),
  new PatchContentExtractor(),
  new MonsterDropsExtractor(),
  new MappyExtractor(),
  new LgbExtractor(),
  new GubalExtractor(),
  new AllaganReportsExtractor(),
  new GatheringSearchIndexExtractor(),
  new ItemDetailsExtractExtractor()
];

(async () => {
  const kobold = new KoboldService();
  await kobold.init();
  const xiv = new XivDataService(kobold);
  xiv.UIColor = await xiv.getSheet('UIColor');

  const operationsSelection = new MultiSelect({
    name: 'operations',
    message: 'What should be extracted ?',
    choices: [
      'everything',
      ...extractors.map(extractor => {
        return extractor.getName();
      })
    ]
  });

  if (argv['only']) {
    const only = argv['only'].split(',');
    startExtractors(extractors.filter(e => {
      return only.includes(e.getName());
    }));
  } else {
    operationsSelection.run().then((selection: string[]) => {
      startExtractors(extractors.filter(e => {
        return selection.includes('everything') || selection.includes(e.getName());
      }));
    });
  }


  function startExtractors(selectedExtractors: AbstractExtractor[]): void {
    const multiBar = new MultiBar({
      format: ' {bar} | {label} | {value}/{total} | {duration_formatted}',
      hideCursor: true,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      emptyOnZero: true,
      forceRedraw: true
    });

    const globalBar = multiBar.create(selectedExtractors.length, 0, { label: 'All Extractors' });

    from(selectedExtractors).pipe(
      mergeMap(extractor => {
        const progress = multiBar.create(0, 0, { label: extractor.getName() });
        extractor.setProgress(progress);
        extractor.setMultiBarRef(multiBar);
        return extractor.extract(xiv).pipe(
          tap(() => {
            progress.stop();
            multiBar.remove(progress);
          })
        );
      }, 1)
    ).subscribe({
      next: () => {
        globalBar.increment();
      },
      complete: () => {
        multiBar.stop();
        process.exit(0);
      }
    });
  }
})();
