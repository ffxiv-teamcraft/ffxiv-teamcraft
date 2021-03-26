import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleTabsetComponent } from './simple-tabset/simple-tabset.component';
import { SimpleTabComponent } from './simple-tab/simple-tab.component';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [SimpleTabsetComponent, SimpleTabComponent],
  exports: [SimpleTabsetComponent, SimpleTabComponent],
  imports: [
    CommonModule,
    FlexLayoutModule
  ]
})
export class SimpleTabsetModule {
}
