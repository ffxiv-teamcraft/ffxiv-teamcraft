import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatExpansionModule,
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
import {UserService} from './core/firebase/user.service';
import {CoreModule} from './core/core.module';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {FirebaseDataModule} from './core/firebase/firebase-data.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ClipboardModule} from 'ngx-clipboard/dist';
import {PipesModule} from './pipes/pipes.module';
import {TooltipModule} from './modules/tooltip/tooltip.module';
import {DonationModule} from './modules/donation/donation.module';
import {SettingsModule} from './modules/settings/settings.module';
import {CartImportModule} from './pages/cart-import/cart-import.module';
import {CommonComponentsModule} from './modules/common-components/common-components.module';
import {HomeModule} from './pages/home/home.module';
import {ItemModule} from './modules/item/item.module';
import {FavoritesModule} from './pages/favorites/favorites.module';
import {ListDetailsModule} from './pages/list-details/list-details.module';
import {RecipesModule} from './pages/recipes/recipes.module';
import {ListsModule} from 'app/pages/lists/lists.module';


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

        BrowserModule,
        FormsModule,
        ReactiveFormsModule,

        NgSerializerModule.forRoot(),

        // App Modules
        CoreModule,
        FirebaseDataModule,
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
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
