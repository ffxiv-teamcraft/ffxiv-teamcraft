import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
} from '@angular/material';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {environment} from '../environments/environment';
import {FirebaseOptionsToken} from 'angularfire2';
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
import {CartImportModule} from './pages/list-import/list-import.module';
import {CommonComponentsModule} from './modules/common-components/common-components.module';
import {ItemModule} from './modules/item/item.module';
import {ListModule} from './pages/list/list.module';
import {BetaDisclaimerModule} from './modules/beta-disclaimer/beta-disclaimer.module';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {MaintenanceModule} from './pages/maintenance/maintenance.module';
import {GivewayPopupModule} from './modules/giveway-popup/giveway-popup.module';
import {WorkshopModule} from './pages/workshop/workshop.module';
import {TemplateModule} from './pages/template/template.module';
import {AlarmsSidebarModule} from './modules/alarms-sidebar/alarms-sidebar.module';
import {MarkdownModule} from 'ngx-markdown';
import {WikiModule} from './pages/wiki/wiki.module';
import {SimulatorModule} from './pages/simulator/simulator.module';
import {NgDragDropModule} from 'ng-drag-drop';
import {IS_ELECTRON} from './core/tools/platform.service';
import {CommissionBoardModule} from './pages/commission-board/commission-board.module';
import {AppRoutingModule} from './app-routing.module';

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        AppComponent,
    ],
    providers: [
        {provide: FirebaseOptionsToken, useValue: environment.firebase}
    ],
    imports: [
        FlexLayoutModule,

        MarkdownModule.forRoot(),

        NgDragDropModule.forRoot(),

        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),

        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFirestoreModule,

        RouterModule.forRoot([], {useHash: IS_ELECTRON}),

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
        MatFormFieldModule,
        MatInputModule,
        MatSliderModule,
        MatBadgeModule,

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
        AlarmsSidebarModule,

        AppRoutingModule,
        // Pages
        WikiModule,
        ListModule,
        MaintenanceModule,
        WorkshopModule,
        TemplateModule,
        SimulatorModule,
        CommissionBoardModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
