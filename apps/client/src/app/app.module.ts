import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgSerializerModule } from '@kaiu/ng-serializer';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MarkdownModule } from 'ngx-markdown';
import { NgDragDropModule } from 'ng-drag-drop';
import { IS_ELECTRON, PlatformService } from './core/tools/platform.service';
import { AppRoutingModule } from './app-routing.module';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { en_US, NgZorroAntdModule, NZ_I18N, NZ_MESSAGE_CONFIG } from 'ng-zorro-antd';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PipesModule } from './pipes/pipes.module';
import { authReducer, initialState as authInitialState } from './+state/auth.reducer';
import { AuthEffects } from './+state/auth.effects';
import { AuthFacade } from './+state/auth.facade';
import { AuthModule } from './core/auth/auth.module';
import { AlarmsSidebarModule } from './modules/alarms-sidebar/alarms-sidebar.module';
import { AlarmsModule } from './core/alarms/alarms.module';
import { ListModule } from './modules/list/list.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule, FirestoreSettingsToken } from '@angular/fire/firestore';
import { XivapiClientModule } from '@xivapi/angular-client';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UserAvatarModule } from './modules/user-avatar/user-avatar.module';
import { TeamsModule } from './modules/teams/teams.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SimulatorModule } from './pages/simulator/simulator.module';
import { TranslationsLoaderFactory } from './translations-loader';
import { RotationsModule } from './modules/rotations/rotations.module';
import { CustomLinksModule } from './modules/custom-links/custom-links.module';
import { PageLoaderModule } from './modules/page-loader/page-loader.module';
import { MapModule } from './modules/map/map.module';
import { LayoutModule } from './core/layout/layout.module';
import { LoadingScreenModule } from './pages/loading-screen/loading-screen.module';
import { CustomItemsModule } from './modules/custom-items/custom-items.module';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    AuthFacade,
    {
      provide: NZ_MESSAGE_CONFIG,
      useValue: {
        nzDuration: 10000,
        nzMaxStack: 8,
        nzPauseOnHover: true,
        nzAnimate: true,
        nzTop: '92px',
        nzBottom: '24px',
        nzPlacement: 'topRight'
      }
    },
    { provide: FirestoreSettingsToken, useValue: {} }
  ],
  imports: [
    FlexLayoutModule,

    MarkdownModule.forRoot(),

    NgDragDropModule.forRoot(),

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslationsLoaderFactory,
        deps: [HttpClient, PlatformService]
      }
    }),

    AngularFireModule.initializeApp(environment.firebase),

    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule,

    XivapiClientModule.forRoot(null),

    RouterModule.forRoot([], { useHash: IS_ELECTRON }),

    AppRoutingModule,
    AuthModule,
    ListModule,
    WorkshopModule,
    TeamsModule,
    LayoutModule,
    NotificationsModule,
    SettingsModule.forRoot(),
    MapModule.forRoot(),
    UserAvatarModule,
    SimulatorModule,
    RotationsModule,
    CustomLinksModule,
    CustomItemsModule,
    PageLoaderModule,
    LoadingScreenModule,

    HttpClientModule,

    BrowserAnimationsModule,

    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    FormsModule,
    ReactiveFormsModule,

    NgSerializerModule.forRoot(),

    AppRoutingModule,
    CoreModule.forRoot(),
    PipesModule,
    AlarmsModule,
    AlarmsSidebarModule,

    NgZorroAntdModule,
    NgDragDropModule.forRoot(),
    NgxDnDModule,

    StoreModule.forRoot({}, {}),
    !environment.production ? StoreDevtoolsModule.instrument({
      name: 'FFXIV Teamcraft'
    }) : [],
    EffectsModule.forRoot([]),
    StoreModule.forFeature('auth', authReducer, { initialState: authInitialState }),
    EffectsModule.forFeature([AuthEffects])
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
