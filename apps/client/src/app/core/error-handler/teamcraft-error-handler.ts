import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TeamcraftErrorHandler extends ErrorHandler {
  private message: NzMessageService;
  private translate: TranslateService;

  constructor(injector: Injector) {
    super();
    setTimeout(() => {
      this.message = injector.get(NzMessageService);
      this.translate = injector.get(TranslateService);

    });
  }

  handleError(error: any): void {
    const message = error.message ? error.message : error.toString();
    if (message.indexOf('Could not reach Cloud Firestore backend') > -1) {
      this.message.error(this.translate.instant('ERRORS.Firebase_blocked'));
    }
    throw error;
  }
}
