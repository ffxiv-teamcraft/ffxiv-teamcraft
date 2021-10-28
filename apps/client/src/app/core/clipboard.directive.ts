import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';
import { isObservable, Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

@Directive({
  selector: '[clipboard]'
})
export class ClipboardDirective {

  @Input('clipboard')
  clipboardInput: string | ((...args: any[]) => string) | ((...args: any[]) => Observable<string>);

  @Input()
  clipboardFnArgs: any[] = [];

  @Input()
  clipboardSuccessMessage: string;

  @Output()
  clipboardCopySuccess = new EventEmitter<{ content: string }>();

  constructor(private clipboardService: Clipboard, private message: NzMessageService,
              private translate: TranslateService) {
  }

  @HostListener('click')
  click(): boolean {
    let content$: Observable<string>;
    if (typeof this.clipboardInput === 'string') {
      content$ = of(this.clipboardInput);
    } else {
      const fnResult = this.clipboardInput(...(Array.isArray(this.clipboardFnArgs) ? this.clipboardFnArgs : [this.clipboardFnArgs]));
      if (isObservable(fnResult)) {
        content$ = fnResult;
      } else {
        content$ = of(fnResult);
      }
    }
    content$.pipe(
      first()
    ).subscribe(content => {
      if (this.clipboardService.copy(content)) {
        if (this.clipboardCopySuccess.observers.length > 0) {
          this.clipboardCopySuccess.emit({ content });
        } else if (this.clipboardSuccessMessage) {
          this.message.success(this.clipboardSuccessMessage);
        } else {
          this.message.success(this.translate.instant('Item_name_copied', { itemname: content }));
        }
      }
    });
    return false;
  }

}
