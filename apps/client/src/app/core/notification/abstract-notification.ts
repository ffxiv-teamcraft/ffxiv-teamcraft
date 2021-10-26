import { NotificationType } from './notification-type';
import { Parent } from '@kaiu/serializer';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../data/localized-data.service';
import { I18nToolsService } from '../tools/i18n-tools.service';
import { ForeignKey } from '../database/relational/foreign-key';
import { TeamcraftUser } from '../../model/user/teamcraft-user';
import { DataModel } from '../database/storage/data-model';
import { Observable } from 'rxjs';

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

  public readonly type: NotificationType;

  protected constructor(_type: NotificationType, target: string) {
    super();
    this.targetId = target;
    this.type = _type;
  }

  public abstract getContent(translate: TranslateService, i18nTools: I18nToolsService): Observable<string>;

  public abstract getTargetRoute(): string[];

  public abstract getIcon(): string;
}
