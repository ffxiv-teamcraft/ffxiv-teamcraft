import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ItemModule } from './item/item.module';
import { DbComponent } from './db/db.component';

const routes: Routes = [

  {
    path: ':language',
    component: DbComponent,
    children: [
      {
        path: 'item',
        loadChildren: () => ItemModule
      }
    ]
  }
];

@NgModule({
  declarations: [DbComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes)
  ]
})
export class DbModule {
}
