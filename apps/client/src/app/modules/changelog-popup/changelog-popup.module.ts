import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangelogPopupComponent } from './changelog-popup/changelog-popup.component';
import { MarkdownModule } from 'ngx-markdown';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [ChangelogPopupComponent],
  exports: [ChangelogPopupComponent],
  imports: [
    CommonModule,
    MarkdownModule,
    NzDividerModule,
    TranslateModule
  ]
})
export class ChangelogPopupModule {
}
