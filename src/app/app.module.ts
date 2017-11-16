import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
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
import {CartImportModule} from './pages/cart-import/cart-import.module';
import {CommonComponentsModule} from './modules/common-components/common-components.module';
import {HomeModule} from './pages/home/home.module';
import {ItemModule} from './modules/item/item.module';
import {FavoritesModule} from './pages/favorites/favorites.module';
import {ListDetailsModule} from './pages/list-details/list-details.module';
import {RecipesModule} from './pages/recipes/recipes.module';
import {ListsModule} from 'app/pages/lists/lists.module';
import {BetaDisclaimerModule} from './modules/beta-disclaimer/beta-disclaimer.module';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {FeaturesModule} from './pages/features/features.module';


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
        SettingsModule,
        CartImportModule,
        CommonComponentsModule,
        HomeModule,
        ItemModule,
        FavoritesModule,
        ListDetailsModule,
        RecipesModule,
        ListsModule,
        FeaturesModule,
        BetaDisclaimerModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
