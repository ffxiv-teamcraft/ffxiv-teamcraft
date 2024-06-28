import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { combineLatest, of } from 'rxjs';
import { omitBy } from 'lodash';
import { I18nName } from '@ffxiv-teamcraft/types';

export class ActionsDbPagesExtractor extends AbstractExtractor {
  protected doExtract(xiv: XivDataService): void {
    const quests = this.requireLazyFileByKey('quests');
    combineLatest([
      this.getSheet<any>(xiv, 'Action', ['Name', 'Icon', 'CooldownGroup#', 'Recast100ms', 'Cast100ms', 'ActionCombo#',
        'CanTargetParty', 'CanTargetDead', 'CanTargetHostile', 'CanTargetSelf',
        'IsPlayerAction', 'ClassJobLevel#', 'ClassJob#', 'ActionCategory#',
        'Range', 'EffectRange', 'PrimaryCostType#', 'PrimaryCostValue#', 'Cost#', 'IsPvP', 'PreservesCombo', 'AffectsPosition',
        'ActionProcStatus.Status.Icon', 'ActionProcStatus.Status.Name'], false, 2),
      xiv.getFromSaintCSV<{ '#': string, Description: I18nName }>('ActionTransient'),
      this.getSheet<any>(xiv, 'CraftAction', ['Name', 'Icon', 'ClassJobLevel', 'ClassJob', 'ActionCategory', 'Cost']),
      xiv.getFromSaintCSV<{ '#': string, Description: I18nName }>('CraftAction'),
      this.getSheet<any>(xiv, 'Trait', ['Name', 'Icon']),
      this.getSheet<any>(xiv, 'TraitTransient', ['Description'])
    ]).subscribe(([actions, actionTransient, craftActions, saintCraftActions, traits, traitTransient]) => {
      const everyActions = [
        ...this.extendNames(actions.map(action => {
          return {
            ...(actionTransient.find(t => +t['#'] === action.index) || {}),
            ...action
          };
        }), [
          {
            field: 'Name',
            koSource: 'koActions',
            zhSource: 'zhActions'
          },
          {
            field: 'Description',
            koSource: 'koActionDescriptions',
            zhSource: 'zhActionDescriptions',
            targetField: 'description'
          }
        ]),
        ...this.extendNames(craftActions.map((action) => {
          return {
            ...(saintCraftActions.find(t => +t['#'] === action.index) || {}),
            ...action
          };
        }), [
          {
            field: 'Name',
            koSource: 'koCraftActions',
            zhSource: 'zhCraftActions'
          },
          {
            field: 'Description',
            koSource: 'koCraftDescriptions',
            zhSource: 'zhCraftDescriptions',
            targetField: 'description'
          }
        ])
      ];
      const extendedTraits = this.extendNames(traits.map(trait => {
        return {
          ...trait,
          ...(traitTransient.find(t => t.index === trait.index) || {})
        };
      }), [
        {
          field: 'Name',
          koSource: 'koTraits',
          zhSource: 'zhTraits'
        },
        {
          field: 'Description',
          koSource: 'koTraitDescriptions',
          zhSource: 'zhTraitDescriptions',
          targetField: 'description'
        }
      ]);
      const questSources = Object.entries(quests)
        .filter(([, value]) => value.action)
        .reduce((acc, [key, value]) => {
          return {
            ...acc,
            [value.action]: +key
          };
        }, {});
      const pages = {};
      everyActions
        .filter(({ extended }) => extended.en.length > 0)
        .forEach(({ row, extended }) => {
          pages[row.index] = {
            id: row.index,
            icon: row.Icon,
            ...extended,
            ...(row.__sheet === 'Action' ? {
              range: row.Range,
              effectRange: row.EffectRange,
              primaryCostType: row.PrimaryCostType,
              primaryCostValue: row.PrimaryCostValue,
              isPvP: row.IsPvP === 1,
              preservesCombo: row.PreservesCombo,
              affectsPosition: row.AffectsPosition,
              cast: row.Cast100ms,
              recast: row.Recast100ms,
              cdGroup: row.CooldownGroup,
              playerAction: row.IsPlayerAction
            } : {}),
            patch: this.findPatch(row.__sheet === 'Action' ? 'action' : 'craftaction', row.index),
            combo: row.ActionCombo,
            fromQuest: questSources[row.index],
            procStatus: row.ActionProcStatus ? {
              id: row.ActionProcStatus.Status.index,
              icon: row.ActionProcStatus.Status.Icon
            } : null,
            traits: extendedTraits.filter((trait) => {
              return trait.extended.description?.en?.toLowerCase().includes(`>${extended.en.toLowerCase()}<`);
            }).map((trait) => {
              return {
                id: trait.row.index,
                icon: trait.row.Icon,
                ...trait.extended
              };
            })
          };

          if (row.__sheet === 'Action') {
            pages[row.index].target = {
              party: row.CanTargetParty,
              dead: row.CanTargetDead,
              hostile: row.CanTargetHostile,
              self: row.CanTargetSelf
            };
          }

          if (row.IsPlayerAction || row._sheet === 'CraftAction') {
            pages[row.index].level = row.ClassJobLevel;
            pages[row.index].job = row.ClassJob;
            pages[row.index].category = row.ActionCategory;
            pages[row.index].cost = row.Cost;
          }
          if (!pages[row.index].procStatus || pages[row.index].procStatus.id === 0) {
            delete pages[row.index].procStatus;
          }

          pages[row.index] = omitBy(pages[row.index], (value, key) => {
            return !value || value?.length === 0;
          });
        });
      this.persistToMinifiedJsonAsset('db/actions-database-pages', pages);
      this.done();
    });
  }

  getName(): string {
    return 'actions-db-pages';
  }

}
