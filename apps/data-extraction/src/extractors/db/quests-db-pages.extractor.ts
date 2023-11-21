import { AbstractExtractor } from '../../abstract-extractor';
import { XivDataService } from '../../xiv/xiv-data.service';
import { LazyQuest } from '@ffxiv-teamcraft/data/model/lazy-quest';
import { uniq } from 'lodash';
import { questChainLengths } from '@ffxiv-teamcraft/data/handmade/quests-chain-lengths';
import { I18nName } from '@ffxiv-teamcraft/types';

export class QuestsDbPagesExtractor extends AbstractExtractor {
  npcs = this.requireLazyFileByKey('npcs');

  npcsTextLookup = Object.entries(this.npcs)
    .reduce((acc, [key, value]) => {
      acc[value.en.split('-').join().split(' ').join().toLowerCase()] = +key;
      return acc;
    }, {});

  protected doExtract(xiv: XivDataService): void {
    const pages = {};
    const textIndex = {};
    const koDescriptions = this.requireLazyFileByKey('koQuestDescriptions');
    const zhDescriptions = this.requireLazyFileByKey('zhQuestDescriptions');
    this.getSheet<any>(xiv, 'Quest',
      [
        'IssuerStart#',
        'TargetEnd#',
        'QuestListenerParams:ActorSpawnSeq',
        'InstanceContentUnlock#',
        'GilReward',
        'ActionReward#',
        'GCSeals#',
        'GrandCompany#',
        'ReputationReward#',
        'PreviousQuest#',
        'JournalGenre#',
        'ClassJobCategory0#',
        'ClassJobLevel#',
        'IsRepeatable',
        'BeastReputationRank#',
        'Id'
      ], false, 1)
      .subscribe(quests => {
        this.getExtendedNames<LazyQuest>('quests', q => q.name).forEach(extended => {
          const row = quests.find(q => q.index === +extended.id);
          const folder = row.Id.split('_')[1].slice(-6, 3);
          const textCSV = xiv.getFromSaintCSV<{ key: string, 0: string, 1: string }>(`quest/${folder}/${row.Id}`, true);
          const { name, ...quest } = extended;
          const ActorSpawnSeq = row.QuestListenerParams.map(({ActorSpawnSeq}) => ActorSpawnSeq).filter(Boolean)
          pages[quest.id] = {
            ...quest,
            id: +quest.id,
            patch: this.findPatch('quest', quest.id),
            description: {
              en: textCSV[2]['1_en'],
              de: textCSV[2]['1_de'],
              ja: textCSV[2]['1_ja'],
              fr: textCSV[2]['1_fr'],
              ko: koDescriptions[quest.id]?.ko,
              zh: zhDescriptions[quest.id]?.zh
            },
            chainLength: questChainLengths[+quest.id],
            genre: row.JournalGenre,
            requires: row.PreviousQuest.filter(Boolean),
            next: quests.filter(q => q.PreviousQuest.includes(row.index)).map(q => q.index),
            start: row.IssuerStart,
            end: row.TargetEnd,
            startingPoint: this.npcs[row.IssuerStart]?.position ?? null,
            npcs: uniq([
              ...ActorSpawnSeq,
              row.IssuerStart
            ]).filter(id => this.npcs[id] !== undefined),
            rewards: [
              ...(quest.rewards || []).map(r => ({ ...r, type: 'item' })),
              row.GilReward ? { id: 1, amount: row.GilReward, type: 'item' } : null,
              row.InstanceContentUnlock ? { id: row.InstanceContentUnlock, type: 'instance' } : null,
              row.ActionReward ? { id: row.ActionReward, type: 'action' } : null,
              row.GCSeals ? { id: [20, 21, 22][row.GrandCompany - 1], amount: row.GCSeals, type: 'item' } : null,
              row.ReputationReward ? { amount: row.ReputationReward, type: 'rep' } : null
            ].filter(Boolean),
            jobCategory: row.ClassJobCategory0,
            level: row.ClassJobLevel[0],
            repeatable: row.IsRepeatable,
            beastRank: row.BeastReputationRank
          };
          textIndex[row.index] = this.processText(textCSV);
        });
        this.persistToMinifiedJsonAsset('db/quests-database-pages', pages);
        this.persistToCompressedJsonAsset('db/quests-text', textIndex);
        this.done();
      });
  }

  processText(textData: Array<{ key: string, 0: string, 1: string }>) {
    // This is a Ts implementation of what's done in XIVAPI's DataCustom/Quest.php.
    return textData
      .reduce((acc, row, i) => {
        const command = row['0'];
        const instructions = command.split('_');
        if (instructions[4] === 'BATTLETALK' || row['1'].length === 0 || row['1'].toLowerCase() === 'str') {
          return acc;
        }
        switch (instructions[3]) {
          case 'SEQ':
            return {
              ...acc,
              ['Journal']: [
                ...(acc['Journal'] || []), {
                  text: this.getI18nText(row),
                  order: +instructions[4] || i
                }
              ]
            };
          case 'TODO':
            return {
              ...acc,
              ['ToDo']: [
                ...(acc['ToDo'] || []), {
                  text: this.getI18nText(row),
                  order: +instructions[4] || i
                }
              ]
            };

          case 'Q1':
          case 'Q2':
          case 'Q3':
          case 'Q4':
          case 'Q5':
          case 'Q6':
          case 'Q7':
          case 'Q8':
          case 'Q9':
          case 'Q10':
          case 'Q11':
          case 'Q12':
          case 'Q13':
          case 'Q14':
          case 'Q15':
          case 'Q16':
          case 'Q17':
          case 'Q18':
          case 'Q19':
          case 'Q20':
          case 'A1':
          case 'A2':
          case 'A3':
          case 'A4':
          case 'A5':
          case 'A6':
          case 'A7':
          case 'A8':
          case 'A9':
          case 'A10':
          case 'A11':
          case 'A12':
          case 'A13':
          case 'A14':
          case 'A15':
          case 'A16':
          case 'A17':
          case 'A18':
          case 'A19':
          case 'A20':
          case 'SCENE':
          case 'ACCESS':
          case 'SYSTEM':
          case 'INSTANCE':
          case 'POP':
            return acc;

          default:
            return {
              ...acc,
              ['Dialogue']: [
                ...(acc['Dialogue'] || []), {
                  text: this.getI18nText(row),
                  npc: this.tryFindNpc(instructions[3]),
                  order: +instructions[4] || i
                }
              ]
            };
        }
      }, {});
  }

  tryFindNpc(name: string): number | null {
    if (!name) {
      return null;
    }
    return this.npcsTextLookup[name.toLowerCase()] || null;
  }

  getI18nText(row: any): I18nName {
    return {
      en: row['1_en'],
      ja: row['1_ja'],
      de: row['1_de'],
      fr: row['1_fr']
    };
  }

  getName(): string {
    return 'quests-db-pages';
  }

}
