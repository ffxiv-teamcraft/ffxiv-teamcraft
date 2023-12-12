import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullpageMessageComponent } from './fullpage-message/fullpage-message.component';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    imports: [
        CommonModule,
        PipesModule,
        FullpageMessageComponent
    ],
    exports: [FullpageMessageComponent]
})
export class FullpageMessageModule {
}
