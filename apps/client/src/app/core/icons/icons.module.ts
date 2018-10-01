import { NgModule } from '@angular/core';
import { IconCopy, IconLayout, IconMap, IconShield } from 'angular-feather';

@NgModule({
  exports: [
    IconLayout,
    IconShield,
    IconCopy,
    IconMap
  ]
})
export class IconsModule {
}
