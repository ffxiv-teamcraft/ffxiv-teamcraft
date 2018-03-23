import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {environment} from '../environments/environment';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {RouterModule} from '@angular/router';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {CoreModule} from './core/core.module';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {DatabaseModule} from './core/database/database.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PipesModule} from './pipes/pipes.module';
import {DonationModule} from './modules/donation/donation.module';
import {SettingsModule} from './pages/settings/settings.module';
import {CartImportModule} from './pages/list-import/list-import.module';
import {CommonComponentsModule} from './modules/common-components/common-components.module';
import {HomeModule} from './pages/home/home.module';
import {ItemModule} from './modules/item/item.module';
import {FavoritesModule} from './pages/favorites/favorites.module';
import {ListModule} from './pages/list/list.module';
import {RecipesModule} from './pages/recipes/recipes.module';
import {ListsModule} from 'app/pages/lists/lists.module';
import {BetaDisclaimerModule} from './modules/beta-disclaimer/beta-disclaimer.module';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {FeaturesModule} from './pages/features/features.module';
import {AlarmsModule} from './pages/alarms/alarms.module';
import {ProfileModule} from './pages/profile/profile.module';
import {PublicListsModule} from './pages/public-lists/public-lists.module';
import {AddItemModule} from './pages/add-item/add-item.module';
import {AboutModule} from './pages/about/about.module';
import {MaintenanceModule} from './pages/maintenance/maintenance.module';
import {GivewayPopupModule} from './modules/giveway-popup/giveway-popup.module';
import {MacroTranslationModule} from './pages/macro-translation/macro-translation.module';
import {GatheringLocationModule} from './pages/gathering-location/gathering-location.module';
import {WorkshopModule} from './pages/workshop/workshop.module';
import {CustomLinksModule} from './pages/custom-links/custom-links.module';
import {LinkModule} from './pages/link/link.module';
import * as Raven from 'raven-js';


Raven
    .config(environment.production ? 'https://759388ec3a3a4868b36832ea92a5afac@sentry.io/481146' : '')
    .install();

export class RavenErrorHandler implements ErrorHandler {
    handleError(err: any): void {
        if (err.message !== 'Not found' && err.message.indexOf('permission') === -1 && err.message.indexOf('is null') === -1) {
            Raven.captureException(err);
        }
        console.error(err);
    }
}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        FlexLayoutModule,

        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),

        AngularFireModule.initializeApp(environment.firebase),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFirestoreModule,

        RouterModule.forRoot([]),

        HttpClientModule,
        // Animations for material.
        BrowserAnimationsModule,

        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatSnackBarModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatIconModule,
        MatListModule,
        MatGridListModule,
        MatCardModule,

        BrowserModule,
        FormsModule,
        ReactiveFormsModule,

        NgSerializerModule.forRoot(),

        // App Modules
        CoreModule,
        DatabaseModule,
        PipesModule,
        DonationModule,
        CartImportModule,
        CommonComponentsModule,
        ItemModule,
        BetaDisclaimerModule,
        GivewayPopupModule,

        // Pages
        HomeModule,
        ProfileModule,
        CustomLinksModule,
        LinkModule,
        FeaturesModule,
        RecipesModule,
        ListsModule,
        PublicListsModule,
        ListModule,
        AlarmsModule,
        FavoritesModule,
        SettingsModule,
        AddItemModule,
        AboutModule,
        MaintenanceModule,
        MacroTranslationModule,
        GatheringLocationModule,
        WorkshopModule,
    ],
    providers: [{provide: ErrorHandler, useClass: RavenErrorHandler}],
    bootstrap: [AppComponent]
})
export class AppModule {
}
