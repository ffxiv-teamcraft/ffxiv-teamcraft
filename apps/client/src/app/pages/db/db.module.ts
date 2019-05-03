import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ItemModule } from './item/item.module';

const routes: Routes = [
  {
    path: 'item',
    loadChildren: () => ItemModule
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    RouterModule.forChild(routes)
  ]
})
export class DbModule {
}
