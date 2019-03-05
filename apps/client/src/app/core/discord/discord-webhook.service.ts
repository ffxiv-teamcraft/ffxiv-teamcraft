import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { first, map, switchMap } from 'rxjs/operators';
import { Team } from '../../model/team/team';
import { List } from '../../modules/list/model/list';
import { LinkToolsService } from '../tools/link-tools.service';
import { LocalizedDataService } from '../data/localized-data.service';
import { CharacterService } from '../api/character.service';
import { WebhookSettingType } from '../../model/team/webhook-setting-type';

@Injectable()
export class DiscordWebhookService {

  public static CLIENT_ID = '514350168678727681';

  private static COLOR = 10982232;

  constructor(private http: HttpClient, private translate: TranslateService,
              private i18n: I18nToolsService, private linkTools: LinkToolsService,
              private l12n: LocalizedDataService, private characterService: CharacterService) {
  }

  sendMessage(team: Team, contentKey: string, contentParams?: Object, iconUrl?: string, imageUrl?: string): void {
    this.i18n.getTranslation(contentKey, team.language, contentParams).pipe(
      first(),
      switchMap(description => {
        const embed: any = {
          author: { name: team.name },
          color: DiscordWebhookService.COLOR,
          timestamp: new Date().toISOString()
        };

        if (description !== undefined) {
          embed.description = description;
        }

        if (iconUrl !== undefined) {
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

  notifyItemAddition(itemId: number, itemIcon: number, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_ADDED)) {
      return;
    }
    const itemName = this.l12n.getItem(itemId);
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_added', {
      amount: amount,
      itemName: itemName[team.language] || itemName.en,
      itemId: itemId,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    }, `https://www.garlandtools.org/files/icons/item/${itemIcon}.png`);
  }

  notifyItemDeletion(itemId: number, itemIcon: number, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_REMOVED)) {
      return;
    }
    const itemName = this.l12n.getItem(itemId);
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_removed', {
      amount: amount,
      itemName: itemName[team.language] || itemName.en,
      itemId: itemId,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    }, `https://www.garlandtools.org/files/icons/item/${itemIcon}.png`);
  }

  notifyItemChecked(team: Team, itemIcon: number, list: List, memberId: string, amount: number, itemId: number): void {
    if (!team.hasSettingEnabled(WebhookSettingType.LIST_PROGRESSION)) {
      return;
    }
    const itemName = this.l12n.getItem(itemId);
    this.characterService.getCharacter(memberId).pipe(
      first(),
      map(character => {
        this.sendMessage(team, 'TEAMS.NOTIFICATIONS.List_progress', {
          characterName: character.character.Name,
          memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
          amount: amount,
          itemName: itemName[team.language] || itemName.en,
          itemId: itemId,
          listName: list.name,
          listUrl: this.linkTools.getLink(`/list/${list.$key}`)
        }, `https://www.garlandtools.org/files/icons/item/${itemIcon}.png`, character.character.Avatar);
      })
    ).subscribe();
  }

  notifyCustomItemAddition(itemName: string, itemIcon: number, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_ADDED)) {
      return;
    }
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_added', {
      amount: amount,
      itemName: itemName,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    }, `https://www.garlandtools.org/files/icons/item/${itemIcon}.png`);
  }

  notifyCustomItemDeletion(itemName: string, itemIcon: number, amount: number, list: List, team: Team): void {
    if (!team.hasSettingEnabled(WebhookSettingType.ITEM_REMOVED)) {
      return;
    }
    this.sendMessage(team, 'TEAMS.NOTIFICATIONS.Item_removed', {
      amount: amount,
      itemName: itemName,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    }, `https://www.garlandtools.org/files/icons/item/${itemIcon}.png`);
  }

  notifyCustomItemChecked(team: Team, itemIcon: number, list: List, memberId: string, amount: number, itemName: string): void {
    if (!team.hasSettingEnabled(WebhookSettingType.LIST_PROGRESSION)) {
      return;
    }
    this.characterService.getCharacter(memberId).pipe(
      first(),
      map(character => {
        this.sendMessage(team, 'TEAMS.NOTIFICATIONS.List_progress', {
          characterName: character.character.Name,
          memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
          amount: amount,
          itemName: itemName,
          listName: list.name,
          listUrl: this.linkTools.getLink(`/list/${list.$key}`)
        }, `https://www.garlandtools.org/files/icons/item/${itemIcon}.png`, character.character.Avatar);
      })
    ).subscribe();
  }

  notifyMemberJoined(team: Team, memberId: string): void {
    if (!team.hasSettingEnabled(WebhookSettingType.MEMBER_JOINED)) {
      return;
    }
    this.characterService.getCharacter(memberId).pipe(
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
    this.characterService.getCharacter(memberId).pipe(
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

  notifyUserAssignment(team: Team, itemIcon: number, memberId: string, itemId: number, list: List): void {
    if (!team.hasSettingEnabled(WebhookSettingType.USER_ASSIGNMENT)) {
      return;
    }
    const itemName = this.l12n.getItem(itemId);
    this.characterService.getCharacter(memberId).pipe(
      first(),
      map(character => {
        this.sendMessage(team, 'TEAMS.NOTIFICATIONS.User_assigned', {
          memberName: character.character.Name,
          memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
          itemName: itemName[team.language] ? itemName[team.language] : itemName.en,
          itemId: itemId,
          listName: list.name,
          listUrl: this.linkTools.getLink(`/list/${list.$key}`)
        }, `https://www.garlandtools.org/files/icons/item/${itemIcon}.png`, character.character.Avatar);
      })
    ).subscribe();
  }

  oauthUrl(state: string, redirectUri: string): string {
    return `https://discordapp.com/api/oauth2/authorize?response_type=code&client_id=${DiscordWebhookService.CLIENT_ID}&scope=webhook.incoming&state=${state}&redirect_uri=${redirectUri}`;
  }
}
