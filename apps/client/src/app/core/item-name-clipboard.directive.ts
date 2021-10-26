import { ComponentFactoryResolver, Directive, ElementRef, HostListener, Input, Renderer2, ViewContainerRef } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { I18nToolsService } from './tools/i18n-tools.service';
import { SettingsService } from '../modules/settings/settings.service';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { TranslateService } from '@ngx-translate/core';
import { first, map, switchMap } from 'rxjs/operators';
import { observeInput } from './rxjs/observe-input';

@Directive({
  selector: '[itemNameCopy]'
})
export class ItemNameClipboardDirective extends NzTooltipDirective {

  @Input('itemNameCopy')
  itemId: number;

  @Input()
  forceCopyMode: 'classic' | 'isearch' = null;

  @Input()
  disableTooltip = false;

  private get copyMode() {
    return this.forceCopyMode || this.settings.preferredCopyType;
  }

  clipboardContent$ = observeInput(this, 'itemId').pipe(
    switchMap(itemId => {
      return this.i18n.getNameObservable('items', itemId).pipe(
        map(itemName => {
          if (this.copyMode === 'isearch') {
            return `/isearch "${itemName}"`;
          }
          return itemName;
        })
      );
    })
  );

  constructor(private clipboardService: Clipboard, private i18n: I18nToolsService, private message: NzMessageService,
              private settings: SettingsService, private translate: TranslateService,
              elementRef: ElementRef, hostView: ViewContainerRef,
              resolver: ComponentFactoryResolver, renderer: Renderer2) {
    super(elementRef, hostView, resolver, renderer);
    if (!this.disableTooltip) {
      this.translate.get(this.copyMode === 'isearch' ? 'Copy_isearch' : 'Copy_item_name_to_clipboard')
        .pipe(
          first()
        ).subscribe(translated => {
        this.title = translated;
      });
    }
    renderer.setStyle(
      elementRef.nativeElement,
      'cursor',
      'pointer'
    );
  }

  @HostListener('click')
  click(): void {
    this.clipboardContent$.pipe(
      first()
    ).subscribe(content => {
      if (this.clipboardService.copy(content)) {
        this.message.success(this.translate.instant('Item_name_copied', { itemname: content }));
      }
    });
  }

}
