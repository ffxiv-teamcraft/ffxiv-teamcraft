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
    loadChildren: './pages/lists/lists-page.module#ListsPageModule'
  },
  {
    path: 'list',
    loadChildren: './pages/list-details/list-details.module#ListDetailsModule'
  },
  {
    path: 'search',
    loadChildren: './pages/search/search.module#SearchModule'
  },
  {
    path: 'gathering-location',
    loadChildren: './pages/gathering-location/gathering-location.module#GatheringLocationModule'
  },
  {
    path: 'alarms',
    loadChildren: './pages/alarms-page/alarms-page.module#AlarmsPageModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
