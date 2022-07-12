import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { first, map, switchMap } from 'rxjs/operators';
import { Team } from '../../model/team/team';
import { List } from '../../modules/list/model/list';
import { LinkToolsService } from '../tools/link-tools.service';
import { LodestoneService } from '../api/lodestone.service';
import { WebhookSettingType } from '../../model/team/webhook-setting-type';
import { PermissionLevel } from '../database/permissions/permission-level.enum';
import { ListController } from '../../modules/list/list-controller';
import { LazyDataFacade } from '../../lazy-data/+state/lazy-data.facade';
import { combineLatest, Observable, of } from 'rxjs';
import { PermissionsController } from '../database/permissions-controller';

@Injectable()
export class DiscordWebhookService {

  public static CLIENT_ID = '514350168678727681';

  private static COLOR = 10982232;

  constructor(private http: HttpClient, private translate: TranslateService,
              private i18n: I18nToolsService, private linkTools: LinkToolsService,
              private characterService: LodestoneService, private lazyData: LazyDataFacade) {
  }

  sendMessage(team: Team, contentKey: string, contentParams?: Object, iconUrl$: Observable<string> = of(''), imageUrl?: string): void {
    if (!team.webhook) {
      return;
    }
    combineLatest([
      this.i18n.getTranslation(contentKey, team.language, contentParams),
      iconUrl$
    ]).pipe(
      first(),
      switchMap(([description, iconUrl]) => {
        const embed: any = {
          author: { name: team.name },
          color: DiscordWebhookService.COLOR,
          timestamp: new Date().toISOString()
        };

        if (description !== undefined) {
          embed.description = description;
        }

        if (iconUrl !== '') {
          embed.author.icon_url = iconUrl;
        }

        if (imageUrl !== undefined) {
          embed.thumbnail = { url: imageUrl };
        }

        return this.http.post(team.webhook, { embeds: [embed] });
      })
    ).subscribe();
  }

  notifyListAddedToTeam(team: Team, list: List): void {
    if (!team.hasSettingEnabled(WebhookSettingType.LIST_ADDED)) {
      return;
    }
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.List_added_notification', {
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`),
      teamName: team.name
    });
  }

  notifyListRemovedFromTeam(team: Team, list: List): void {
    if (!team.hasSettingEnabled(WebhookSettingType.LIST_REMOVED)) {
      return;
    }
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.List_removed_notification', {
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`),
      teamName: team.name
    });
  }

  notifyItemAddition(itemId: number, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_ADDED)) {
      return;
    }
    this.i18n.getNameObservable('items', itemId).subscribe(itemName => {
      this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_added', {
        amount: amount,
        itemName: itemName,
        itemId: itemId,
        listName: list.name,
        listUrl: this.linkTools.getLink(`/list/${list.$key}`)
      }, this.getIcon(itemId));
    });
  }

  notifyItemDeletion(itemId: number, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_REMOVED)) {
      return;
    }
    this.i18n.getNameObservable('items', itemId).subscribe(itemName => {
      this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_removed', {
        amount: amount,
        itemName: itemName,
        itemId: itemId,
        listName: list.name,
        listUrl: this.linkTools.getLink(`/list/${list.$key}`)
      }, this.getIcon(itemId));
    });
  }

  notifyItemChecked(team: Team, list: List, memberId: string, fcId: string, amount: number, itemId: number, totalNeeded: number, finalItem: boolean): void {
    if (PermissionsController.getPermissionLevel(list, memberId) < PermissionLevel.PARTICIPATE
      && PermissionsController.getPermissionLevel(list, fcId) < PermissionLevel.PARTICIPATE
      && !team.members.includes(memberId)) {
      return;
    }
    const row = ListController.getItemById(list, itemId, !finalItem, finalItem);
    if (row.done + amount < totalNeeded && !team.hasSettingEnabled(WebhookSettingType.ITEM_PROGRESSION)) {
      return;
    } else if (row.done + amount >= totalNeeded && !team.hasSettingEnabled(WebhookSettingType.ITEM_COMPLETION)) {
      return;
    } else if (row.done + amount < totalNeeded) {
      amount = row.done + amount;
    }
    if (!team.hasSettingEnabled(WebhookSettingType.LIST_PROGRESSION) && !finalItem) {
      return;
    }
    if (!team.hasSettingEnabled(WebhookSettingType.FINAL_LIST_PROGRESSION) && finalItem) {
      return;
    }
    this.characterService.getUserCharacter(memberId).pipe(
      first(),
      switchMap(character => {
        return this.i18n.getNameObservable('items', itemId).pipe(
          map(itemName => {
            this.sendMessage(team, 'TEAMS.NOTIFICATIONS.List_progress', {
              characterName: character ? character.character.Name : this.translate.instant('COMMON.Anonymous'),
              memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
              amount: amount,
              totalNeeded: totalNeeded,
              itemName: itemName,
              itemId: itemId,
              listName: list.name,
              listUrl: this.linkTools.getLink(`/list/${list.$key}`)
            }, this.getIcon(itemId), character ? character.character.Avatar : '');
          })
        );
      })
    ).subscribe();
  }

  notifyCustomItemAddition(itemName: string, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_ADDED)) {
      return;
    }
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_added', {
      amount: amount,
      itemName: itemName,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    }, undefined);
  }

  notifyCustomItemDeletion(itemName: string, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_REMOVED)) {
      return;
    }
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_removed', {
      amount: amount,
      itemName: itemName,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    }, undefined);
  }

  notifyCustomItemChecked(team: Team, itemId: number, list: List, memberId: string, amount: number, itemName: string): void {
    if (!team.hasSettingEnabled(WebhookSettingType.LIST_PROGRESSION)) {
      return;
    }
    this.characterService.getUserCharacter(memberId).pipe(
      first(),
      map(character => {
        this.sendMessage(team, 'TEAMS.NOTIFICATIONS.List_progress', {
          characterName: character.character.Name,
          memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
          amount: amount,
          itemName: itemName,
          listName: list.name,
          listUrl: this.linkTools.getLink(`/list/${list.$key}`)
        }, this.getIcon(itemId), character.character.Avatar);
      })
    ).subscribe();
  }

  notifyMemberJoined(team: Team, memberId: string): void {
    if (!team.hasSettingEnabled(WebhookSettingType.MEMBER_JOINED)) {
      return;
    }
    this.characterService.getUserCharacter(memberId).pipe(
      first(),
      map(character => {
        this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Member_joined', {
          memberName: character.character.Name,
          teamName: team.name,
          memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`)
        }, undefined, character.character.Avatar);
      })
    ).subscribe();
  }

  notifyMemberKicked(team: Team, memberId: string): void {
    if (!team.hasSettingEnabled(WebhookSettingType.MEMBER_LEFT)) {
      return;
    }
    this.characterService.getUserCharacter(memberId).pipe(
      first(),
      map(character => {
        this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Member_removed', {
          memberName: character.character.Name,
          teamName: team.name,
          memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`)
        }, undefined, character.character.Avatar);
      })
    ).subscribe();
  }

  notifyUserAssignment(team: Team, memberId: string, itemId: number, list: List): void {
    if (!team.hasSettingEnabled(WebhookSettingType.USER_ASSIGNMENT)) {
      return;
    }
    this.characterService.getUserCharacter(memberId).pipe(
      first(),
      switchMap(character => {
        return this.i18n.getNameObservable('items', itemId).pipe(
          map(itemName => {
            this.sendMessage(team, 'TEAMS.NOTIFICATIONS.User_assigned', {
              memberName: character.character.Name,
              memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
              itemName: itemName,
              itemId: itemId,
              listName: list.name,
              listUrl: this.linkTools.getLink(`/list/${list.$key}`)
            }, this.getIcon(itemId), character.character.Avatar);
          }));
      })
    ).subscribe();
  }

  oauthUrl(state: string, redirectUri: string): string {
    return `https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=${DiscordWebhookService.CLIENT_ID}&scope=webhook.incoming&state=${state}&redirect_uri=${redirectUri}`;
  }

  private getIcon(itemId: number): Observable<string> {
    return this.lazyData.getRow('itemIcons', itemId).pipe(
      map(icon => `https://xivapi.com${icon}`)
    );
  }
}
