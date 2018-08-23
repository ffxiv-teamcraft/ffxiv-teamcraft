import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyableNameComponent } from './copyable-name/copyable-name.component';
import { MatTooltipModule } from '@angular/material';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [
    CommonModule,

    ClipboardModule,

    MatTooltipModule
  ],
  declarations: [CopyableNameComponent],
  exports: [CopyableNameComponent]
})
export class CopyableNameModule {
}
