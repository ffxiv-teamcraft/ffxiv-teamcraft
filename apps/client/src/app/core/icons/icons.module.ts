import { NgModule } from '@angular/core';
import { IconCopy, IconLayout, IconShield } from 'angular-feather';

@NgModule({
  exports: [
    IconLayout,
    IconShield,
    IconCopy,
  ]
})
export class IconsModule {
}
