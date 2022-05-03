import { BrowserModule } from '@angular/platform-browser';
import { NgModule, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
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
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { NZ_CONFIG, NzConfig } from 'ng-zorro-antd/core/config';
import { NZ_ICONS } from 'ng-zorro-antd/icon';
import { registerLocaleData } from '@angular/common';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PipesModule } from './pipes/pipes.module';
import { authReducer, initialState as authInitialState } from './+state/auth.reducer';
import { AuthEffects } from './+state/auth.effects';
import { AuthModule } from './core/auth/auth.module';
import { AlarmsSidebarModule } from './modules/alarms-sidebar/alarms-sidebar.module';
import { AlarmsModule } from './core/alarms/alarms.module';
import { ListModule } from './modules/list/list.module';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { XivapiClientModule } from '@xivapi/angular-client';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { TranslationsLoaderFactory } from './translations-loader';
import { IconDefinition } from '@ant-design/icons-angular';
import {
  AppstoreOutline,
  ArrowRightOutline,
  BellOutline,
  BookOutline,
  BuildOutline,
  CodeOutline,
  DesktopOutline,
  EnvironmentOutline,
  ExperimentOutline,
  FileDoneOutline,
  FileTextOutline,
  FilterOutline,
  FormOutline,
  HomeOutline,
  HourglassOutline,
  InfoOutline,
  LayoutOutline,
  LineChartOutline,
  LockOutline,
  LoginOutline,
  MessageOutline,
  NotificationOutline,
  PlayCircleOutline,
  PlusOutline,
  ProfileOutline,
  ReloadOutline,
  SelectOutline,
  SettingOutline,
  ShareAltOutline,
  ShoppingOutline,
  SolutionOutline,
  UsergroupAddOutline
} from '@ant-design/icons-angular/icons';
import { UniversalInterceptor } from './universal-interceptor';
import { DirtyModule } from './core/dirty/dirty.module';
import { TeamsModule } from './modules/teams/teams.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UserAvatarModule } from './modules/user-avatar/user-avatar.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SimulatorModule } from './pages/simulator/simulator.module';
import { RotationsModule } from './modules/rotations/rotations.module';
import { CustomLinksModule } from './modules/custom-links/custom-links.module';
import { PageLoaderModule } from './modules/page-loader/page-loader.module';
import { MapModule } from './modules/map/map.module';
import { LoadingScreenModule } from './pages/loading-screen/loading-screen.module';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { LayoutModule } from '@angular/cdk/layout';
import { CustomItemsModule } from './modules/custom-items/custom-items.module';
import en from '@angular/common/locales/en';
import fr from '@angular/common/locales/fr';
import de from '@angular/common/locales/de';
import ja from '@angular/common/locales/ja';
import zh from '@angular/common/locales/zh';
import ru from '@angular/common/locales/ru';
import es from '@angular/common/locales/es';
import pt from '@angular/common/locales/pt';
import hr from '@angular/common/locales/hr';
import ko from '@angular/common/locales/ko';
import { InventoryModule } from './modules/inventory/inventory.module';
import { EorzeaModule } from './modules/eorzea/eorzea.module';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import { GraphQLModule } from './graphql.module';
import { ApolloInterceptor } from './apollo-interceptor';
import { QuickSearchModule } from './modules/quick-search/quick-search.module';
import { GearsetsModule } from './modules/gearsets/gearsets.module';
import { ChangelogPopupModule } from './modules/changelog-popup/changelog-popup.module';
import { PlayerMetricsModule } from './modules/player-metrics/player-metrics.module';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { CraftingReplayModule } from './modules/crafting-replay/crafting-replay.module';
import { AntdSharedModule } from './core/antd-shared.module';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NavigationSidebarModule } from './modules/navigation-sidebar/navigation-sidebar.module';
import { APP_INITIALIZERS } from './app-initializers';
import { FreeCompanyWorkshopsModule } from './modules/free-company-workshops/free-company-workshops.module';
import { AdsModule } from './modules/ads/ads.module';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { NzNoAnimationModule } from 'ng-zorro-antd/core/no-animation';
import * as AllaganReportsGQLProviders from './pages/allagan-reports/allagan-reports.gql';
import { LazyDataModule } from './lazy-data/lazy-data.module';
import { initialState as listsInitialState, listsReducer } from './modules/list/+state/lists.reducer';
import { ListsEffects } from './modules/list/+state/lists.effects';
import { ListsActionTypes, SetItemDone } from './modules/list/+state/lists.actions';

const icons: IconDefinition[] = [
  SettingOutline,
  NotificationOutline,
  FormOutline,
  LoginOutline,
  ProfileOutline,
  SolutionOutline,
  BuildOutline,
  BellOutline,
  EnvironmentOutline,
  BookOutline,
  FileDoneOutline,
  MessageOutline,
  DesktopOutline,
  ShareAltOutline,
  ReloadOutline,
  FilterOutline,
  SelectOutline,
  InfoOutline,
  ArrowRightOutline,
  PlusOutline,
  ExperimentOutline,
  LockOutline,
  LayoutOutline,
  UsergroupAddOutline,
  LineChartOutline,
  ShoppingOutline,
  CodeOutline,
  FileTextOutline,
  AppstoreOutline,
  HourglassOutline,
  HomeOutline,
  PlayCircleOutline
];

registerLocaleData(en);
registerLocaleData(fr);
registerLocaleData(de);
registerLocaleData(ja);
registerLocaleData(zh);
registerLocaleData(es);
registerLocaleData(pt);
registerLocaleData(hr);
registerLocaleData(ru);
registerLocaleData(ko);

const nzConfig: NzConfig = {
  message: {
    nzDuration: 10000,
    nzMaxStack: 8,
    nzPauseOnHover: true,
    nzAnimate: true,
    nzTop: '92px'
  }
};

@NgModule({
  declarations: [
    AppComponent
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    {
      provide: NZ_CONFIG,
      useValue: nzConfig
    },
    { provide: NZ_ICONS, useValue: icons },
    { provide: HTTP_INTERCEPTORS, useClass: UniversalInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApolloInterceptor, multi: true },
    ...APP_INITIALIZERS,
    ...Object.values(AllaganReportsGQLProviders)
  ],
  imports: [
    FlexLayoutModule,

    MarkdownModule.forRoot(),

    NgDragDropModule.forRoot(),

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslationsLoaderFactory,
        deps: [HttpClient, PLATFORM_ID, PlatformService]
      }
    }),

    AngularFireModule.initializeApp(environment.firebase),

    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule.enablePersistence({
      synchronizeTabs: true
    }),
    AngularFireFunctionsModule,

    XivapiClientModule.forRoot(),

    RouterModule.forRoot([], { useHash: IS_ELECTRON }),
    DirtyModule,

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
    GearsetsModule,
    CraftingReplayModule,

    ChangelogPopupModule,

    AlarmsModule,
    AlarmsSidebarModule,

    QuickSearchModule,

    InventoryModule,
    EorzeaModule,
    FreeCompanyWorkshopsModule,

    HttpClientModule,

    environment.noAnimations ? NoopAnimationsModule : BrowserAnimationsModule,
    environment.noAnimations ? NzNoAnimationModule : [],

    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    NgSerializerModule.forRoot(),

    AppRoutingModule,
    CoreModule.forRoot(),
    PipesModule,

    AntdSharedModule,
    NzMenuModule,
    NgDragDropModule.forRoot(),
    NgxDnDModule,

    StoreModule.forRoot({}, {
      runtimeChecks: {
        strictStateSerializability: false,
        strictActionSerializability: false,
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictActionWithinNgZone: false
      }
    }),
    !environment.production ? StoreDevtoolsModule.instrument({
      name: 'FFXIV Teamcraft',
      stateSanitizer: (state) => {
        const { lazyData, ...sanitized } = state;
        return sanitized;
      },
      actionSanitizer: (action) => {
        if (action.type.includes('LazyData')) {
          return { type: action.type };
        }
        if(action.type === ListsActionTypes.SetItemDone){
          const { settings, ...sanitized } = (action as SetItemDone);
          return sanitized;
        }
        return action;
      }
    }) : [],
    EffectsModule.forRoot([]),
    StoreModule.forFeature('auth', authReducer, { initialState: authInitialState }),
    EffectsModule.forFeature([AuthEffects]),

    StoreModule.forFeature('lists', listsReducer, { initialState: listsInitialState }),
    EffectsModule.forFeature([ListsEffects]),

    GraphQLModule,

    PlayerMetricsModule,
    NzSpaceModule,
    NzLayoutModule,
    NzAvatarModule,
    NzSpinModule,
    NzAlertModule,
    NavigationSidebarModule,
    AdsModule,
    NgxGoogleAnalyticsModule.forRoot('G-RNVD9NJW4N'),
    NgxGoogleAnalyticsRouterModule,
    LazyDataModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
