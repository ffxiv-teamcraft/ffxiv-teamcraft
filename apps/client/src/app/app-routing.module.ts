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
    path: 'workshop',
    loadChildren: './pages/workshop-details/workshop-details.module#WorkshopDetailsModule'
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
    path: 'levequests',
    loadChildren: './pages/levequests/levequests.module#LevequestsModule'
  },
  {
    path: 'alarms',
    loadChildren: './pages/alarms-page/alarms-page.module#AlarmsPageModule'
  },
  {
    path: 'community-lists',
    loadChildren: './pages/community-lists/community-lists.module#CommunityListsModule'
  },
  {
    path: 'teams',
    loadChildren: './pages/teams-pages/teams-pages.module#TeamsPagesModule'
  },
  {
    path: 'favorites',
    loadChildren: './pages/favorites-page/favorites-page.module#FavoritesPageModule'
  },
  {
    path: 'macro-translator',
    loadChildren: './pages/macro-translator/macro-translator.module#MacroTranslatorModule'
  },
  {
    path: 'profile',
    loadChildren: './pages/profile/profile.module#ProfileModule'
  },
  {
    path: 'about',
    loadChildren: './pages/about/about.module#AboutModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
