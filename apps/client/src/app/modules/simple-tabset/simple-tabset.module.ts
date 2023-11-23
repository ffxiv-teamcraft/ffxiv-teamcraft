import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimpleTabsetComponent } from './simple-tabset/simple-tabset.component';
import { SimpleTabComponent } from './simple-tab/simple-tab.component';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
    exports: [SimpleTabsetComponent, SimpleTabComponent],
    imports: [
        CommonModule,
        FlexLayoutModule,
        SimpleTabsetComponent, SimpleTabComponent
    ]
})
export class SimpleTabsetModule {
}
