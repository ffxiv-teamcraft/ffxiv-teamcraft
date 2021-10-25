import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[clipboard]'
})
export class ClipboardDirective {

  @Input('clipboard')
  clipboardInput: string | ((...args: any[]) => string);

  @Input()
  clipboardFnArgs: any[] = [];

  @Input()
  clipboardSuccessMessage: string;

  @Output()
  clipboardCopySuccess = new EventEmitter<{ content: string }>();

  private get clipboardContent(): string {
    if (typeof this.clipboardInput === 'string') {
      return this.clipboardInput;
    } else {
      return this.clipboardInput(...this.clipboardFnArgs);
    }
  }

  constructor(private clipboardService: Clipboard, private message: NzMessageService,
              private translate: TranslateService) {
  }

  @HostListener('click')
  click(): void {
    const content = this.clipboardContent;
    if (this.clipboardService.copy(content)) {
      if (this.clipboardCopySuccess.observers.length > 0) {
        this.clipboardCopySuccess.emit({ content });
      } else if (this.clipboardSuccessMessage) {
        this.message.success(this.clipboardSuccessMessage);
      } else {
        this.message.success(this.translate.instant('Item_name_copied', { itemname: content }));
      }
    }
  }

}
