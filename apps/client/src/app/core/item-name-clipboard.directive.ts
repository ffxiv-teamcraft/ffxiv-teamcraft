import { Directive, ElementRef, HostListener, Input, OnInit, Renderer2, inject } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NzMessageService } from 'ng-zorro-antd/message';
import { I18nToolsService } from './tools/i18n-tools.service';
import { SettingsService } from '../modules/settings/settings.service';
import { NzTooltipDirective } from 'ng-zorro-antd/tooltip';
import { TranslateService } from '@ngx-translate/core';
import { first, map, switchMap } from 'rxjs/operators';
import { observeInput } from './rxjs/observe-input';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[itemNameCopy]',
  standalone: true
})
export class ItemNameClipboardDirective extends NzTooltipDirective implements OnInit {
  private clipboardService = inject(Clipboard);
  private i18n = inject(I18nToolsService);
  private message = inject(NzMessageService);
  private settings = inject(SettingsService);
  private translate = inject(TranslateService);


  @Input('itemNameCopy')
  itemId: number;

  @Input()
  forceCopyMode: 'classic' | 'isearch' = null;

  @Input()
  disableTooltip = false;

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

  constructor() {
    const elementRef = inject(ElementRef);
    const renderer = inject(Renderer2);

    super();
    renderer.setStyle(
      elementRef.nativeElement,
      'cursor',
      'pointer'
    );
  }

  private get copyMode() {
    return this.forceCopyMode || this.settings.preferredCopyType;
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

  ngOnInit(): void {
    if (!this.disableTooltip) {
      this.translate.get(this.copyMode === 'isearch' ? 'Copy_isearch' : 'Copy_item_name_to_clipboard')
        .pipe(
          first()
        ).subscribe(translated => {
        this.title = translated;
      });
    }
  }

}
