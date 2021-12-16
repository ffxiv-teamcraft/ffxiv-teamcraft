import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyScrollComponent } from './lazy-scroll/lazy-scroll.component';
import { ScrollingModule } from '@angular/cdk/scrolling';


@NgModule({
  declarations: [LazyScrollComponent],
  exports: [LazyScrollComponent],
  imports: [
    CommonModule,
    ScrollingModule
  ]
})
export class LazyScrollModule {
}
