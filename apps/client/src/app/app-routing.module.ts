import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevGuard } from './core/guard/dev.guard';
import { ModeratorGuard } from './core/guard/moderator.guard';

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
    path: 'recipes',
    redirectTo: 'search',
    pathMatch: 'full'
  },
  {
    path: 'lists',
    loadChildren: () => import('./pages/lists/lists-page.module').then(m => m.ListsPageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./pages/list-details/list-details.module').then(m => m.ListDetailsModule)
  },
  {
    path: 'workshop',
    loadChildren: () => import('./pages/workshop-details/workshop-details.module').then(m => m.WorkshopDetailsModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./pages/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'gathering-location',
    loadChildren: () => import('./pages/gathering-location/gathering-location.module').then(m => m.GatheringLocationModule)
  },
  {
    path: 'gc-supply',
    loadChildren: () => import('./pages/gc-supply/gc-supply.module').then(m => m.GcSupplyModule)
  },
  {
    path: 'treasure-finder',
    loadChildren: () => import('./pages/treasure-finder/treasure-finder.module').then(m => m.TreasureFinderModule)
  },
  {
    path: 'levequests',
    loadChildren: () => import('./pages/levequests/levequests.module').then(m => m.LevequestsModule)
  },
  {
    path: 'log-tracker',
    loadChildren: () => import('./pages/log-tracker/log-tracker.module').then(m => m.LogTrackerModule)
  },
  {
    path: 'alarms',
    loadChildren: () => import('./pages/alarms-page/alarms-page.module').then(m => m.AlarmsPageModule)
  },
  {
    path: 'alarm-group',
    loadChildren: () => import('./pages/alarm-group/alarm-group.module').then(m => m.AlarmGroupModule)
  },
  {
    path: 'alarms-overlay',
    loadChildren: () => import('./pages/alarms-overlay/alarms-overlay.module').then(m => m.AlarmsOverlayModule)
  },
  {
    path: 'fishing-reporter-overlay',
    loadChildren: () => import('./pages/fishing-reporter-overlay/fishing-reporter-overlay.module').then(m => m.FishingReporterOverlayModule)
  },
  {
    path: 'mappy',
    loadChildren: () => import('./pages/mappy/mappy.module').then(m => m.MappyModule)
  },
  {
    path: 'mappy-overlay',
    loadChildren: () => import('./pages/mappy-overlay/mappy-overlay.module').then(m => m.MappyOverlayModule)
  },
  {
    path: 'list-panel-overlay',
    loadChildren: () => import('./pages/list-panel-overlay/list-panel-overlay.module').then(m => m.ListPanelOverlayModule)
  },
  {
    path: 'rotation-overlay',
    loadChildren: () => import('./pages/rotation-overlay/rotation-overlay.module').then(m => m.RotationOverlayModule)
  },
  {
    path: 'item-search-overlay',
    loadChildren: () => import('./pages/item-search-overlay/item-search-overlay.module').then(m => m.ItemSearchOverlayModule)
  },
  {
    path: 'community-lists',
    loadChildren: () => import('./pages/community-lists/community-lists.module').then(m => m.CommunityListsModule)
  },
  {
    path: 'commission',
    loadChildren: () => import('./pages/commission/commission.module').then(m => m.CommissionModule)
  },
  {
    path: 'commissions',
    loadChildren: () => import('./pages/commissions/commissions.module').then(m => m.CommissionsModule)
  },
  {
    path: 'teams',
    loadChildren: () => import('./pages/teams-pages/teams-pages.module').then(m => m.TeamsPagesModule)
  },
  {
    path: 'favorites',
    loadChildren: () => import('./pages/favorites-page/favorites-page.module').then(m => m.FavoritesPageModule)
  },
  {
    path: 'macro-translator',
    loadChildren: () => import('./pages/macro-translator/macro-translator.module').then(m => m.MacroTranslatorModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'island-workshop',
    loadChildren: () => import('./pages/island-workshop/island-workshop.module').then(m => m.IslandWorkshopModule)
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule)
  },
  {
    path: 'import',
    loadChildren: () => import('./pages/import/import.module').then(m => m.ImportModule)
  },
  {
    path: 'patreon-redirect',
    loadChildren: () => import('./pages/patreon-redirect/patreon-redirect.module').then(m => m.PatreonRedirectModule)
  },
  {
    path: 'list-import/:importString',
    redirectTo: 'import/:importString'
  },
  {
    path: 'custom-links',
    loadChildren: () => import('./pages/custom-links/custom-links-page.module').then(m => m.CustomLinksPageModule)
  },
  {
    path: 'link',
    loadChildren: () => import('./pages/link/link.module').then(m => m.LinkModule)
  },
  {
    path: 'template',
    loadChildren: () => import('./pages/template/template.module').then(m => m.TemplateModule)
  },
  {
    path: 'custom-items',
    loadChildren: () => import('./pages/custom-items/custom-items-page.module').then(m => m.CustomItemsPageModule)
  },
  {
    path: 'desynth',
    loadChildren: () => import('./pages/desynth/desynth.module').then(m => m.DesynthModule)
  },
  {
    path: 'retainers',
    loadChildren: () => import('./pages/retainers/retainers.module').then(m => m.RetainersModule)
  },
  {
    path: 'retainer-ventures',
    loadChildren: () => import('./pages/retainer-ventures/retainer-ventures.module').then(m => m.RetainerVenturesModule)
  },
  {
    path: 'voyage-tracker',
    loadChildren: () => import('./pages/voyage-tracker/voyage-tracker.module').then(m => m.VoyageTrackerModule)
  },
  {
    path: 'db',
    loadChildren: () => import('./pages/db/db.module').then(m => m.DbModule)
  },
  {
    path: 'recipe-finder',
    loadChildren: () => import('./pages/recipe-finder/recipe-finder.module').then(m => m.RecipeFinderModule)
  },
  {
    path: 'currency-spending',
    loadChildren: () => import('./pages/currency-spending/currency-spending.module').then(m => m.CurrencySpendingModule)
  },
  {
    path: 'food-picker',
    loadChildren: () => import('./pages/food-picker/food-picker.module').then(m => m.FoodPickerModule)
  },
  {
    path: 'leveling-equipment',
    loadChildren: () => import('./pages/leveling-equipment/leveling-equipment.module').then(m => m.LevelingEquipmentModule)
  },
  {
    path: 'blog',
    loadChildren: () => import('./pages/blog/blog.module').then(m => m.BlogModule)
  },
  {
    path: 'reset-timers',
    loadChildren: () => import('./pages/reset-timers/reset-timers.module').then(m => m.ResetTimersModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./pages/inventory/inventory-page.module').then(m => m.InventoryPageModule)
  },
  {
    path: 'inventory-optimizer',
    loadChildren: () => import('./pages/inventory-optimizer/inventory-optimizer.module').then(m => m.InventoryOptimizerModule)
  },
  {
    path: 'gearset',
    loadChildren: () => import('./pages/gearset/gearset.module').then(m => m.GearsetModule)
  },
  {
    path: 'gearset-folder',
    loadChildren: () => import('./pages/gearset-folder/gearset-folder.module').then(m => m.GearsetFolderModule)
  },
  {
    path: 'gearsets',
    loadChildren: () => import('./pages/gearsets-page/gearsets-page.module').then(m => m.GearsetsPageModule)
  },
  {
    path: 'metrics',
    loadChildren: () => import('./pages/metrics/metrics.module').then(m => m.MetricsModule)
  },
  {
    path: 'crafting-replays',
    loadChildren: () => import('./pages/crafting-replays/crafting-replays.module').then(m => m.CraftingReplaysModule)
  },
  {
    path: 'crafting-replay',
    loadChildren: () => import('./pages/crafting-replay/crafting-replay-page.module').then(m => m.CraftingReplayPageModule)
  },
  {
    path: 'crafting-replay-folder',
    loadChildren: () => import('./pages/crafting-replay-folder/crafting-replay-folder.module').then(m => m.CraftingReplayFolderModule)
  },
  {
    path: 'collectables',
    loadChildren: () => import('./pages/collectables/collectables.module').then(m => m.CollectablesModule)
  },
  {
    path: 'layouts',
    loadChildren: () => import('./pages/layout-editor-page/layout-editor-page.module').then(m => m.LayoutEditorPageModule)
  },
  {
    path: 'allagan-reports',
    loadChildren: () => import('./pages/allagan-reports/allagan-reports.module').then(m => m.AllaganReportsModule)
  },
  {
    path: 'profits-helper',
    loadChildren: () => import('./pages/profits-helper/profits-helper.module').then(m => m.ProfitsHelperModule)
  },
  {
    path: 'extractor',
    loadChildren: () => import('./pages/extractor/extractor.module').then(m => m.ExtractorModule),
    canLoad: [DevGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    canLoad: [ModeratorGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
