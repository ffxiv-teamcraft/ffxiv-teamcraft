import { NotificationType } from './notification-type';
import { Parent } from '@kaiu/serializer';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../data/localized-data.service';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { DataModel } from '../database/storage/data-model';

@Parent({
  allowSelf: false,
  discriminatorField: 'type'
})
export abstract class AbstractNotification extends DataModel {

  public date: number;

  public read = false;

  public alerted = false;

  @ForeignKey(TeamcraftUser)
  public targetId: string;

  protected constructor(public readonly type: NotificationType, public readonly target: string) {
    super();
    this.targetId = target;
  }

  public abstract getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string;

  public abstract getTargetRoute(): string[];

  public abstract getIcon(): string;
}
