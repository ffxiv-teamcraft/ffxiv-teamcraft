import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangelogPopupComponent } from './changelog-popup/changelog-popup.component';
import { MarkdownModule } from 'ngx-markdown';



@NgModule({
  declarations: [ChangelogPopupComponent],
  exports: [ChangelogPopupComponent],
  imports: [
    CommonModule,
    MarkdownModule
  ]
})
export class ChangelogPopupModule { }
