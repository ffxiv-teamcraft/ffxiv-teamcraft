import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'lists',
    loadChildren: './pages/lists/lists.module#ListsModule'
  },
  {
    path: 'search',
    loadChildren: './pages/search/search.module#SearchModule'
  },
  {
    path: 'gathering-location',
    loadChildren: './pages/gathering-location/gathering-location.module#GatheringLocationModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
