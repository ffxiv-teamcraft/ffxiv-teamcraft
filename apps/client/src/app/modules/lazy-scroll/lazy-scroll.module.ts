import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyScrollComponent } from './lazy-scroll/lazy-scroll.component';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
    exports: [LazyScrollComponent],
    imports: [
        CommonModule,
        ScrollingModule,
        LazyScrollComponent
    ]
})
export class LazyScrollModule {
}
