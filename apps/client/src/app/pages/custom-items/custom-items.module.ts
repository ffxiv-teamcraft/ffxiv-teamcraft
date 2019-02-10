import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomItemsComponent } from './custom-items/custom-items.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  component: CustomItemsComponent
}];

@NgModule({
  declarations: [CustomItemsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CustomItemsModule {
}
