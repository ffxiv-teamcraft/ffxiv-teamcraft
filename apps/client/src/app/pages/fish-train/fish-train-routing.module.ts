import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FishTrainComponent } from './fish-train/fish-train.component';

const routes: Routes = [{ path: ':id', component: FishTrainComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FishTrainRoutingModule {
}
