import { Inject, Pipe, PipeTransform, PLATFORM_ID } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LinkToolsService } from '../../../core/tools/link-tools.service';
import { I18nName } from '../../../model/common/i18n-name';
import { I18nToolsService } from '../../../core/tools/i18n-tools.service';
import { DbComment } from './model/db-comment';
import { Language } from '../../../core/data/language';
import { LazyDataFacade } from '../../../lazy-data/+state/lazy-data.facade';
import { isPlatformBrowser } from '@angular/common';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { mapIds } from '../../../core/data/sources/map-ids';
import { safeCombineLatest } from '../../../core/rxjs/safe-combine-latest';

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
              private i18n: I18nToolsService, private lazyData: LazyDataFacade,
              @Inject(PLATFORM_ID) private platform: Object) {
  }

  transform(value: string, locale: string, comment: DbComment): Observable<SafeHtml> {
    if (isPlatformBrowser(this.platform)) {
      return combineLatest([
        safeCombineLatest(this.getRegexResult(this.xivdbRegexp, value).map(groups => {
          const data = {
            id: +groups[3],
            type: groups[2],
            language: groups[1]
          };
          return this.getName(data.type, data.id).pipe(
            map(name => {
              return { name, type: data.type, id: data.id };
            })
          );
        })),
        safeCombineLatest(this.getRegexResult(this.customSyntaxRegexp, value).map(groups => {
          const data = {
            id: groups[2],
            type: groups[1],
            language: comment.language
          };
          return this.getId(groups[1], groups[2], comment.language as Language).pipe(
            switchMap(id => {
              return this.getName(data.type, id).pipe(
                map(name => {
                  return { name, type: data.type, id: id };
                })
              );
            })
          );
        })),
        safeCombineLatest(this.getRegexResult(this.tcRegexp, value).map(groups => {
          const data = {
            id: +groups[3],
            type: groups[2],
            language: groups[1]
          };
          return this.getName(data.type, data.id).pipe(
            map(name => {
              return { name, type: data.type, id: data.id };
            })
          );
        }))
      ]).pipe(
        map(res => {
          const registry = res.flat();
          value = value.replace(this.xivdbRegexp, (match, ...groups) => {
            const data = {
              id: +groups[2],
              type: groups[1],
              language: groups[0]
            };
            return `<a href='${this.getTeamcraftLink(match, data)}' target='_blank'>${this.getI18nName(registry.find(row => row.id === data.id && row.type === data.type)?.name, locale, match)}</a>`;
          });

          value = value.replace(this.customSyntaxRegexp, (match, ...groups) => {
            const data = {
              id: groups[1],
              type: groups[0],
              language: comment.language
            };
            const registryEntry = registry.find(row => row.name[comment.language]?.toLowerCase() === data.id.toLowerCase() && row.type === data.type);
            return `<a href='${this.getTeamcraftLink(match, {
              ...registryEntry,
              language: comment.language
            })}' target='_blank'>${this.getI18nName(registryEntry?.name, locale, match)}</a>`;
          });

          value = value.replace(this.tcRegexp, (match, ...groups) => {
            const data = {
              id: +groups[2],
              type: groups[1],
              language: groups[0]
            };
            return `<a href='${this.getTeamcraftLink(match, data)}' target='_blank'>${this.getI18nName(registry.find(row => row.id === data.id && row.type === data.type)?.name, locale, match)}</a>`;
          });

          value = value.replace(this.linkRegexp, (match) => {
            return `<a href='${match}' target='_blank'>${match}</a>`;
          });

          return this.sanitizer.bypassSecurityTrustHtml(value);
        })
      );
    }
    return of(value);
  }

  getTeamcraftLink(link: string, match: { type: string, id: number, language: string }): string {
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

  getRegexResult(regex: RegExp, value: string): RegExpExecArray[] {
    const res = [];
    let row = null;
    while (row = regex.exec(value)) {
      res.push(row);
    }
    return res;
  }

  getName(contentType: string, id: number): Observable<I18nName> {
    switch (contentType) {
      case 'item':
        return this.lazyData.getI18nName('items', id);
      case 'fate':
        return this.lazyData.getI18nName('fates', id);
      case 'action':
        return combineLatest([
          this.lazyData.getI18nName('actions', id),
          this.lazyData.getI18nName('craftActions', id)
        ]).pipe(
          map(([action, craftAction]) => {
            return action || craftAction;
          })
        );
      case 'instance':
        return this.lazyData.getI18nName('instances', id);
      case 'leve':
        return this.lazyData.getI18nName('leves', id);
      case 'map':
        const entry = mapIds.find((m) => m.id === id);
        return this.lazyData.getI18nName('places', entry ? entry.zone : 1);
      case 'mob':
        return this.lazyData.getI18nName('mobs', id);
      case 'node':
        return of(this.i18n.createFakeI18n(`Node #${id}`));
      case 'npc':
        return this.lazyData.getI18nName('npcs', id);
      case 'quest':
        return this.lazyData.getI18nName('quests', id);
      case 'status':
        return this.lazyData.getI18nName('statuses', id);
      case 'trait':
        return this.lazyData.getI18nName('traits', id);
      case 'achievement':
        return this.lazyData.getI18nName('achievements', id);
      default:
        return of(null);
    }
  }

  getId(contentType: string, name: string, lang: Language): Observable<number> {
    switch (contentType) {
      case 'item':
        return this.lazyData.getIndexByName('items', name, lang);
      case 'fate':
        return this.lazyData.getIndexByName('fates', name, lang);
      case 'action':
        return this.lazyData.getIndexByName('actions', name, lang).pipe(
          switchMap(id => {
            if (id) {
              return of(id);
            }
            return this.lazyData.getIndexByName('craftActions', name, lang);
          })
        );
      case 'instance':
        return this.lazyData.getIndexByName('instances', name, lang);
      case 'leve':
        return this.lazyData.getIndexByName('leves', name, lang);
      case 'map':
        return this.lazyData.getIndexByName('places', name, lang).pipe(
          switchMap(result => this.lazyData.getEntry('maps').pipe(
            map(maps => +Object.keys(maps).find((key) => maps[key].placename_id === result))
          ))
        );
      case 'mob':
        return this.lazyData.getIndexByName('mobs', name, lang);
      case 'npc':
        return this.lazyData.getIndexByName('npcs', name, lang);
      case 'achievement':
        return this.lazyData.getIndexByName('achievements', name, lang);
      case 'status':
        return this.lazyData.getIndexByName('statuses', name, lang);
      case 'trait':
        return this.lazyData.getIndexByName('traits', name, lang);
      case 'quest':
        return this.lazyData.getIndexByName('quests', name, lang);
      default:
        return of(null);
    }
  }

  private getI18nName(name: I18nName, locale: string, fallback: string): string {
    return name ? (name[locale] || name.en) : fallback;
  }

}
