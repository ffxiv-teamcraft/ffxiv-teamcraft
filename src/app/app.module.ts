import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MdButtonModule,
    MdCardModule,
    MdChipsModule,
    MdDialogModule,
    MdExpansionModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdPaginatorModule,
    MdSnackBarModule,
    MdToolbarModule,
    MdTooltipModule
} from '@angular/material';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RecipesComponent} from './recipes/recipes.component';
import {ListsComponent} from './lists/lists.component';
import {environment} from '../environments/environment';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {ListManagerService} from './core/list-manager.service';
import {ConfirmationPopupComponent} from './confirmation-popup/confirmation-popup.component';
import {RouterModule, Routes} from '@angular/router';
import {ListComponent} from './list/list.component';
import {ItemComponent} from './item/item.component';
import {XivdbService} from './core/xivdb.service';
import {ListNamePopupComponent} from './list-name-popup/list-name-popup.component';
import {I18nTools} from './core/i18n-tools';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/recipes',
        pathMatch: 'full'
    },
    {
        path: 'recipes',
        component: RecipesComponent
    },
    {
        path: 'list/:uid/:listId',
        component: ListComponent
    },
    {
        path: 'lists',
        component: ListsComponent
    },
];

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

@NgModule({
    declarations: [
        AppComponent,
        RecipesComponent,
        ListsComponent,
        ConfirmationPopupComponent,
        ListComponent,
        ItemComponent,
        ListNamePopupComponent,
    ],
    imports: [
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

        RouterModule.forRoot(routes),

        HttpClientModule,
        // Animations for material.
        BrowserAnimationsModule,

        MdCardModule,
        MdIconModule,
        MdListModule,
        MdPaginatorModule,
        MdInputModule,
        MdToolbarModule,
        MdButtonModule,
        MdDialogModule,
        MdMenuModule,
        MdSnackBarModule,
        MdExpansionModule,
        MdTooltipModule,
        MdChipsModule,

        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule
    ],
    entryComponents: [
        ListNamePopupComponent,
        ConfirmationPopupComponent
    ],
    providers: [
        XivdbService,
        ListManagerService,
        I18nTools
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
