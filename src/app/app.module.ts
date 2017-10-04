import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MdButtonModule,
    MdCardModule,
    MdCheckboxModule,
    MdChipsModule,
    MdDialogModule,
    MdExpansionModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdPaginatorModule, MdProgressBarModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdSidenavModule,
    MdSlideToggleModule,
    MdSnackBarModule,
    MdToolbarModule,
    MdTooltipModule
} from '@angular/material';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {RecipesComponent} from './component/recipes/recipes.component';
import {ListsComponent} from './component/lists/lists.component';
import {environment} from '../environments/environment';
import {AngularFireModule} from 'angularfire2';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {ConfirmationPopupComponent} from './component/popup/confirmation-popup/confirmation-popup.component';
import {RouterModule, Routes} from '@angular/router';
import {ListDetailsComponent} from './component/list-details/list-details.component';
import {ItemComponent} from './component/item/item.component';
import {ListNamePopupComponent} from './component/popup/list-name-popup/list-name-popup.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {GatheredByPopupComponent} from './component/popup/gathered-by-popup/gathered-by-popup.component';
import {DropsDetailsPopupComponent} from './component/popup/drops-details-popup/drops-details-popup.component';
import {TradeDetailsPopupComponent} from './component/popup/trade-details-popup/trade-details-popup.component';
import {DesynthPopupComponent} from './component/popup/desynth-popup/desynth-popup.component';
import {VendorsDetailsPopupComponent} from './component/popup/vendors-details-popup/vendors-details-popup.component';
import {InstancesDetailsPopupComponent} from './component/popup/instances-details-popup/instances-details-popup.component';
import {LoginPopupComponent} from './component/popup/login-popup/login-popup.component';
import {RegisterPopupComponent} from './component/popup/register-popup/register-popup.component';
import {CharacterAddPopupComponent} from './component/popup/character-add-popup/character-add-popup.component';
import {UserService} from './core/user.service';
import {CoreModule} from './core/core.module';
import {NgSerializerModule} from '@kaiu/ng-serializer';
import {FirebaseDataModule} from './core/firebase/firebase-data.module';
import {CeilPipe} from './pipe/ceil.pipe';
import {RecipeComponent} from './component/recipe/recipe.component';
import {ReductionDetailsPopupComponent} from './component/popup/reduction-details-popup/reduction-details-popup.component';
import {I18nPipe} from './pipe/i18n.pipe';
import {RegenerationPopupComponent} from './component/popup/regeneration-popup/regeneration-popup.component';
import {HomeComponent} from './component/home/home.component';
import {FavoritesComponent} from './component/favorites/favorites.component';
import {ListRowComponent} from './component/list-row/list-row.component';
import {AmountInputComponent} from './component/common/amount-input/amount-input.component';
import { BulkAdditionPopupComponent } from './component/popup/bulk-addition-popup/bulk-addition-popup.component';
import { RandomGifComponent } from './component/common/random-gif/random-gif.component';
import { ItemIconComponent } from './component/common/item-icon/item-icon.component';
import { RequirementsPopupComponent } from './component/popup/requirements-popup/requirements-popup.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'favorites',
        component: FavoritesComponent
    },
    {
        path: 'recipes',
        component: RecipesComponent
    },
    {
        path: 'list/:uid/:listId',
        component: ListDetailsComponent
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
        ListDetailsComponent,
        ItemComponent,
        ListNamePopupComponent,
        GatheredByPopupComponent,
        DropsDetailsPopupComponent,
        TradeDetailsPopupComponent,
        DesynthPopupComponent,
        VendorsDetailsPopupComponent,
        InstancesDetailsPopupComponent,
        LoginPopupComponent,
        RegisterPopupComponent,
        CharacterAddPopupComponent,
        CeilPipe,
        RecipeComponent,
        ReductionDetailsPopupComponent,
        I18nPipe,
        RegenerationPopupComponent,
        HomeComponent,
        FavoritesComponent,
        ListRowComponent,
        AmountInputComponent,
        BulkAdditionPopupComponent,
        RandomGifComponent,
        ItemIconComponent,
        RequirementsPopupComponent,
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
        MdSidenavModule,
        MdGridListModule,
        MdCheckboxModule,
        MdSlideToggleModule,
        MdProgressSpinnerModule,
        MdRadioModule,
        MdGridListModule,
        MdProgressBarModule,

        BrowserModule,
        FormsModule,
        ReactiveFormsModule,

        NgSerializerModule.forRoot(),

        // App Modules
        CoreModule,
        FirebaseDataModule
    ],
    entryComponents: [
        ListNamePopupComponent,
        ConfirmationPopupComponent,
        GatheredByPopupComponent,
        DropsDetailsPopupComponent,
        TradeDetailsPopupComponent,
        DesynthPopupComponent,
        VendorsDetailsPopupComponent,
        InstancesDetailsPopupComponent,
        LoginPopupComponent,
        RegisterPopupComponent,
        CharacterAddPopupComponent,
        ReductionDetailsPopupComponent,
        RegenerationPopupComponent,
        BulkAdditionPopupComponent,
        RequirementsPopupComponent,
    ],
    providers: [
        UserService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
