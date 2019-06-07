import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { LocalizedDataService } from '../../../core/data/localized-data.service';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';

@Pipe({
  name: 'commentLinks',
  pure: true
})
export class CommentLinksPipe implements PipeTransform {

  private xivdbRegexp = /https?:\/\/(en|fr|de|ja)?\.?xivdb\.com\/(\w+)\/(\d+)\/(\S+)/gmi;
  private tcRegexp = /https:\/\/ffxivteamcraft\.com\/db\/(\w+)\/(\w+)\/(\d+)\/(\S+)/gmi;
  private linkRegexp = /https?:\/\/[^ .]+(\.)\w+\S/gmi;

  constructor(private sanitizer: DomSanitizer, private linkTools: LinkToolsService,
              private l12n: LocalizedDataService, private i18n: I18nToolsService) {
  }

  transform(value: string, locale: string): SafeHtml {
    value = value.replace(this.xivdbRegexp, (match, ...groups) => {
      const data = {
        id: +groups[2],
        type: groups[1],
        language: groups[0]
      };
      return `<a href="${this.getTeamcraftLink(match, data)}" target="_blank">${this.getI18nName(this.getName(data.type, data.id), locale, match)}</a>`;
    });

    value = value.replace(this.tcRegexp, (match, ...groups) => {
      console.log(groups);
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
        return this.l12n.getFate(id).name;
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
        return this.l12n.getQuest(id).name;
      case 'status':
        return this.l12n.getStatus(id);
      case 'trait':
        return this.l12n.getTrait(id);
      default:
        return null;
    }
  }

  private getI18nName(name: I18nName, locale: string, fallback: string): string {
    return name ? (name[locale] || name.en) : fallback;
  }

}
