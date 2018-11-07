import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { first, switchMap } from 'rxjs/operators';
import { Team } from '../../model/team/team';
import { List } from '../../modules/list/model/list';
import { LinkToolsService } from '../tools/link-tools.service';
import { LocalizedDataService } from '../data/localized-data.service';
import { combineLatest, of } from 'rxjs';

@Injectable()
export class DiscordWebhookService {

  constructor(private http: HttpClient, private translate: TranslateService,
              private i18n: I18nToolsService, private linkTools: LinkToolsService,
              private l12n: LocalizedDataService) {
  }

  sendMessage(hook: string, language: string, contentKey: string, contentParams?: Object, descriptionKey?: string, descriptionParams?: Object): void {
    combineLatest(this.i18n.getTranslation(contentKey, language, contentParams), descriptionKey ? this.i18n.getTranslation(descriptionKey, language, descriptionParams) : of(null)).pipe(
      switchMap(([content, description]) => {
        const notification: any = { content: content };
        if (description !== null) {
          notification.description = description;
        }
        return this.http.post(hook, notification);
      }),
      first()
    ).subscribe();
  }

  notifyListAddedToTeam(team: Team, list: List): void {
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.List_added_notification', {
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`),
      teamName: team.name
    });
  }

  notifyListRemovedFromTeam(team: Team, list: List): void {
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.List_removed_notification', {
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`),
      teamName: team.name
    });
  }

  notifyItemAddition(itemId: number, amount: number, list: List, team: Team): void {
    const itemName = this.l12n.getItem(itemId);
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.Item_added', {
      amount: amount,
      itemName: itemName[team.language] || itemName.en,
      itemId: itemId,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    });
  }

  notifyItemDeletion(itemId: number, amount: number, list: List, team: Team): void {
    const itemName = this.l12n.getItem(itemId);
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.Item_removed', {
      amount: amount,
      itemName: itemName[team.language] || itemName.en,
      itemId: itemId,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    });
  }

  notifyItemChecked(team: Team, list: List, characterName: string, memberId: string, amount: number, itemId: number): void {
    const itemName = this.l12n.getItem(itemId);
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.List_progress', {
      characterName: characterName,
      memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
      amount: amount,
      itemName: itemName[team.language] || itemName.en,
      itemId: itemId,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    });
  }

  notifyMemberJoined(team: Team, characterName: string, memberId: string): void {
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.Member_joined', {
      memberName: characterName,
      teamName: team.name,
      memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`)
    });
  }

  notifyMemberKicked(team: Team, characterName: string, memberId: string): void {
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.Member_removed', {
      memberName: characterName,
      teamName: team.name,
      memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`)
    });
  }

  notifyUserAssignment(team: Team, memberName: string, memberId: string, itemId: number, list: List): void {
    const itemName = this.l12n.getItem(itemId);
    this.sendMessage(team.webhook, team.language, 'TEAMS.NOTIFICATIONS.User_assigned', {
      memberName: memberName,
      memberProfileUrl: this.linkTools.getLink(`/profile/${memberId}`),
      itemName: itemName[team.language] ? itemName[team.language] : itemName.en,
      itemId: itemId,
      listName: list.name,
      listUrl: this.linkTools.getLink(`/list/${list.$key}`)
    });
  }
}
