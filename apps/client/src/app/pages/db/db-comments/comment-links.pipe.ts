import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { DbComment } from './model/db-comment';
import { Language } from '../../../core/data/language';
import { LazyDataService } from '../../../core/data/lazy-data.service';
import { achievements } from '../../../core/data/sources/achievements';

@Pipe({
  name: 'commentLinks',
  pure: true
})
export class CommentLinksPipe implements PipeTransform {

  private xivdbRegexp = /(?:^|\s)https?:\/\/(en|fr|de|ja|www)?\.?xivdb\.com\/(\w+)\/(\d+)\/(\S+)/gmi;
  private tcRegexp = /(?:^|\s)https:\/\/ffxivteamcraft\.com\/db\/(\w+)\/(\w+)\/(\d+)\/(\S+)/gmi;
  private linkRegexp = /(?:^|\s)https?:\/\/\S+/gmi;

  private customSyntaxRegexp = /(item|map|mob|achievement|leve|npc|instance|quest|trait|action|status):"([^"]+)"/gmi;

  constructor(private sanitizer: DomSanitizer, private linkTools: LinkToolsService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService,
              private lazyData: LazyDataService) {
  }

  transform(value: string, locale: string, comment: DbComment): SafeHtml {
    value = value.replace(this.xivdbRegexp, (match, ...groups) => {
      const data = {
        id: +groups[2],
        type: groups[1],
        language: groups[0]
      };
      return `<a href="${this.getTeamcraftLink(match, data)}" target="_blank">${this.getI18nName(this.getName(data.type, data.id), locale, match)}</a>`;
    });

    value = value.replace(this.customSyntaxRegexp, (match, ...groups) => {
      const data = {
        id: this.getId(groups[0], groups[1], comment.language as Language),
        type: groups[0],
        language: comment.language
      };
      return `<a href="${this.getTeamcraftLink(match, data)}" target="_blank">${this.getI18nName(this.getName(data.type, data.id), locale, match)}</a>`;
    });

    value = value.replace(this.tcRegexp, (match, ...groups) => {
      const data = {
        id: +groups[2],
        type: groups[1],
        language: groups[0]
      };
      return `<a href="${this.getTeamcraftLink(match, data)}" target="_blank">${this.getI18nName(this.getName(data.type, data.id), locale, match)}</a>`;
    });

    value = value.replace(this.linkRegexp, (match) => {
      return `<a href="${match}" target="_blank">${match}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  getTeamcraftLink(link: string, match: any): string {
    let contentType: string;
    switch (match.type) {
      case 'placename':
        contentType = 'map';
        break;
      case 'gathering':
        contentType = 'node';
        break;
      default:
        contentType = match.type;
        break;
    }
    return this.linkTools.getLink(`/db/${match.language || 'en'}/${contentType}/${match.id}`);
  }

  getName(contentType: string, id: number): I18nName {
    switch (contentType) {
      case 'item':
        return this.l12n.getItem(id);
      case 'fate':
        const fate = this.l12n.getFate(id);
        return fate && fate.name;
      case 'action':
        return this.l12n.getAction(id);
      case 'instance':
        return this.l12n.getInstanceName(id);
      case 'leve':
        return this.l12n.getLeve(id);
      case 'map':
        return this.l12n.getMapName(id);
      case 'mob':
        return this.l12n.getMob(id);
      case 'node':
        return this.i18n.createFakeI18n(`Node #${id}`);
      case 'npc':
        return this.l12n.getNpc(id);
      case 'quest':
        const quest = this.l12n.getQuest(id);
        return quest && quest.name;
      case 'status':
        return this.l12n.getStatus(id);
      case 'trait':
        return this.l12n.getTrait(id);
      case 'achievement':
        return achievements[id];
      default:
        return null;
    }
  }

  getId(contentType: string, name: string, lang: Language): number {
    let data: any;
    switch (contentType) {
      case 'item':
        data = [this.lazyData.items, this.lazyData.koItems, this.lazyData.zhItems];
        break;
      case 'fate':
        data = [this.lazyData.fates, this.lazyData.koFates];
        break;
      case 'action':
        data = [this.lazyData.actions, this.lazyData.craftActions, this.lazyData.koActions, this.lazyData.koCraftActions];
        break;
      case 'instance':
        data = [this.lazyData.instances, this.lazyData.koInstances];
        break;
      case 'leve':
        data = [this.lazyData.leves, this.lazyData.koLeves];
        break;
      case 'map':
        data = [this.lazyData.places, this.lazyData.koPlaces, this.lazyData.zhPlaces];
        break;
      case 'mob':
        data = [this.lazyData.mobs, this.lazyData.koMobs];
        break;
      case 'npc':
        data = [this.lazyData.npcs, this.lazyData.koNpcs];
        break;
      case 'achievement':
        data = [achievements];
        break;
      case 'status':
        data = [this.lazyData.statuses, this.lazyData.koStatuses];
        break;
      case 'trait':
        data = [this.lazyData.traits, this.lazyData.koTraits];
        break;
      case 'quest':
        data = [this.lazyData.quests, this.lazyData.koQuests];
        break;
      default:
        return null;
    }
    const entries = this.lazyData.merge(...data);
    let result = this.l12n.getIndexByName(entries, name.trim().replace(/-/, '–'), lang)
      || this.l12n.getIndexByName(entries, name.trim().replace(/-/, '–'), 'en');

    if (contentType === 'map') {
      result = this.l12n.getMapId(this.l12n.getPlace(result).en);
    }
    return result;
  }

  private getI18nName(name: I18nName, locale: string, fallback: string): string {
    return name ? (name[locale] || name.en) : fallback;
  }

}
