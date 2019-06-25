import { AbstractNotification } from '../../core/notification/abstract-notification';
import { TranslateService } from '@ngx-translate/core';
import { LocalizedDataService } from '../../core/data/localized-data.service';
import { I18nToolsService } from '../../core/tools/i18n-tools.service';
import { NotificationType } from '../../core/notification/notification-type';

export class BlogPostNotification extends AbstractNotification {

  constructor(private title: string, private slug: string, target: string) {
    super(NotificationType.BLOG_POST, target);
  }

  getContent(translate: TranslateService, l12n: LocalizedDataService, i18nTools: I18nToolsService): string {
    return translate.instant('NOTIFICATIONS.Blog_post', {
      title: this.title
    });
  }

  getIcon(): string {
    return 'message';
  }

  getTargetRoute(): string[] {
    return [`/blog/${this.slug}`];
  }

}
