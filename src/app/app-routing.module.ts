import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'about',
        loadChildren: 'app/pages/about/about.module#AboutModule'
    },
    {
        path: 'add-item',
        loadChildren: 'app/pages/add-item/add-item.module#AddItemModule'
    },
    {
        path: 'alarms',
        loadChildren: 'app/pages/alarms/alarms.module#AlarmsModule'
    },
    {
        path: 'custom-links',
        loadChildren: 'app/pages/custom-links/custom-links.module#CustomLinksModule'
    },
    {
        path: 'favorites',
        loadChildren: 'app/pages/favorites/favorites.module#FavoritesModule'
    },
    {
        path: 'gathering-location',
        loadChildren: 'app/pages/gathering-location/gathering-location.module#GatheringLocationModule'
    },
    {
        path: 'home',
        loadChildren: 'app/pages/home/home.module#HomeModule'
    },
    {
        path: 'link',
        loadChildren: 'app/pages/link/link.module#LinkModule'
    },
    {
        path: 'lists',
        loadChildren: 'app/pages/lists/lists.module#ListsModule'
    },
    {
        path: 'macro-translation',
        loadChildren: 'app/pages/macro-translation/macro-translation.module#MacroTranslationModule'
    },
    {
        path: 'notifications',
        loadChildren: 'app/pages/notifications/notifications.module#NotificationsModule'
    },
    {
        path: 'profile',
        loadChildren: 'app/pages/profile/profile.module#ProfileModule'
    },
    {
        path: 'public-lists',
        loadChildren: 'app/pages/public-lists/public-lists.module#PublicListsModule'
    },
    {
        path: 'recipes',
        loadChildren: 'app/pages/recipes/recipes.module#RecipesModule'
    },
    {
        path: 'settings',
        loadChildren: 'app/pages/settings/settings.module#SettingsModule'
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
