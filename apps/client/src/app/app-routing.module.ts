import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'home',
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
    path: 'gc-supply',
    loadChildren: './pages/gc-supply/gc-supply.module#GcSupplyModule'
  },
  {
    path: 'levequests',
    loadChildren: './pages/levequests/levequests.module#LevequestsModule'
  },
  {
    path: 'log-tracker',
    loadChildren: './pages/log-tracker/log-tracker.module#LogTrackerModule'
  },
  {
    path: 'alarms',
    loadChildren: './pages/alarms-page/alarms-page.module#AlarmsPageModule'
  },
  {
    path: 'alarms-overlay',
    loadChildren: './pages/alarms-overlay/alarms-overlay.module#AlarmsOverlayModule'
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
  },
  {
    path: 'import',
    loadChildren: './pages/import/import.module#ImportModule'
  },
  {
    path: 'patreon-redirect',
    loadChildren: './pages/patreon-redirect/patreon-redirect.module#PatreonRedirectModule'
  },
  {
    path: 'list-import/:importString',
    redirectTo: 'import/:importString'
  },
  {
    path: 'custom-links',
    loadChildren: './pages/custom-links/custom-links-page.module#CustomLinksPageModule'
  },
  {
    path: 'link',
    loadChildren: './pages/link/link.module#LinkModule'
  },
  {
    path: 'template',
    loadChildren: './pages/template/template.module#TemplateModule'
  },
  {
    path: 'custom-items',
    loadChildren: './pages/custom-items/custom-items-page.module#CustomItemsPageModule'
  },
  {
    path: 'desynth',
    loadChildren: './pages/desynth/desynth.module#DesynthModule'
  },
  {
    path: 'support-us',
    loadChildren: './pages/support-us/support-us.module#SupportUsModule'
  },
  {
    path: 'db',
    loadChildren: './pages/db/db.module#DbModule'
  },
  {
    path: 'recipe-finder',
    loadChildren: './pages/recipe-finder/recipe-finder.module#RecipeFinderModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
