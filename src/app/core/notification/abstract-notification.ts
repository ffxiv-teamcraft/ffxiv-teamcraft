import {NotificationType} from './notification-type';
import {Parent} from '@kaiu/serializer';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../data/localized-data.service';
import {I18nToolsService} from '../tools/i18n-tools.service';

@Parent({
    allowSelf: false,
    discriminatorField: 'type'
})
export abstract class AbstractNotification {

    public readonly date: number;

    protected constructor(public readonly type: NotificationType) {
        this.date = Date.now();
    }

    public abstract getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string;

    public abstract getTargetRoute(): string[];
}
