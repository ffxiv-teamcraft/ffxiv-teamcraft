import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FishTrainsComponent } from './fish-trains/fish-trains.component';

const routes: Routes = [{
  path: '',
  component: FishTrainsComponent,
  data: {
    title: 'TITLE.Fish_Trains'
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FishTrainsRoutingModule { }
