import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { AntdSharedModule } from '../../core/antd-shared.module';
import { CoreModule } from '../../core/core.module';
import { FishingBaitModule } from '../../modules/fishing-bait/fishing-bait.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { I18nDisplayModule } from '../../modules/i18n-display/i18n-display.module';
import { ItemDetailsPopupsModule } from '../../modules/item-details/item-details-popups.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { ListModule } from '../../modules/list/list.module';
import { MapModule } from '../../modules/map/map.module';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { QuickSearchModule } from '../../modules/quick-search/quick-search.module';
import { RotationsModule } from '../../modules/rotations/rotations.module';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { PipesModule } from '../../pipes/pipes.module';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { AchievementComponent } from './achievement/achievement.component';
import { ActionComponent } from './action/action.component';
import { CommentLinksPipe } from './db-comments/comment-links.pipe';
import { DbCommentsComponent } from './db-comments/db-comments/db-comments.component';
import { DbComponent } from './db/db.component';
import { FateComponent } from './fate/fate.component';
import { FishBaitsComponent } from './fish/fish-baits/fish-baits.component';
import { FishBiteTimesComponent } from './fish/fish-bite-times/fish-bite-times.component';
import { FishDetailsContainerComponent } from './fish/fish-details-container/fish-details-container.component';
import { FishHooksetsComponent } from './fish/fish-hooksets/fish-hooksets.component';
import { FishHoursComponent } from './fish/fish-hours/fish-hours.component';
import { FishMoochesComponent } from './fish/fish-mooches/fish-mooches.component';
import { FishSpotsListComponent } from './fish/fish-spots-list/fish-spots-list.component';
import { FishTopUsersComponent } from './fish/fish-top-users/fish-top-users.component';
import { FishUserRankingComponent } from './fish/fish-user-ranking/fish-user-ranking.component';
import { FishWeatherTransitionsComponent } from './fish/fish-weather-transitions/fish-weather-transitions.component';
import { FishWeathersComponent } from './fish/fish-weathers/fish-weathers.component';
import { FishComponent } from './fish/fish.component';
import { FishingMissesPopupComponent } from './fishing-misses-popup/fishing-misses-popup.component';
import { FishingSpotAvailableFishesComponent } from './fishing-spot/fishing-spot-available-fishes/fishing-spot-available-fishes.component';
import { FishingSpotBaitDatagridComponent } from './fishing-spot/fishing-spot-bait-datagrid/fishing-spot-bait-datagrid.component';
import { FishingSpotBiteTimesComponent } from './fishing-spot/fishing-spot-bite-times/fishing-spot-bite-times.component';
import { FishingSpotDatagridComponent } from './fishing-spot/fishing-spot-datagrid/fishing-spot-datagrid.component';
import { FishingSpotHoursComponent } from './fishing-spot/fishing-spot-hours/fishing-spot-hours.component';
import { FishingSpotPositionComponent } from './fishing-spot/fishing-spot-position/fishing-spot-position.component';
import { FishingSpotTugDatagridComponent } from './fishing-spot/fishing-spot-tug-datagrid/fishing-spot-tug-datagrid.component';
import { FishingSpotWeatherDatagridComponent } from './fishing-spot/fishing-spot-weather-datagrid/fishing-spot-weather-datagrid.component';
import { FishingSpotWeatherTransitionsComponent } from './fishing-spot/fishing-spot-weather-transitions/fishing-spot-weather-transitions.component';
import { FishingSpotWeathersComponent } from './fishing-spot/fishing-spot-weathers/fishing-spot-weathers.component';
import { FishingSpotComponent } from './fishing-spot/fishing-spot.component';
import { InstanceComponent } from './instance/instance.component';
import { ItemComponent } from './item/item.component';
import { ModelViewerComponent } from './item/model-viewer/model-viewer.component';
import { LeveComponent } from './leve/leve.component';
import { MapPageComponent } from './map-page/map-page.component';
import { MobComponent } from './mob/mob.component';
import { NodeComponent } from './node/node.component';
import { NpcComponent } from './npc/npc.component';
import { PatchComponent } from './patch/patch.component';
import { QuestComponent } from './quest/quest.component';
import { ItemContextService } from './service/item-context.service';
import { StatusComponent } from './status/status.component';
import { TraitComponent } from './trait/trait.component';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCommentModule } from 'ng-zorro-antd/comment';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { LazyScrollModule } from '../../modules/lazy-scroll/lazy-scroll.module';
import { SpearfishingSpotComponent } from './spearfishing-spot/spearfishing-spot.component';
import { ChartModule } from 'angular2-chartjs';
import 'chartjs-chart-box-and-violin-plot/build/Chart.BoxPlot.js';
import { ApolloClientResolver } from '../../core/apollo-client.resolver';
import { FishDataModule } from './fish/fish-data.module';
import { FishingSpotHooksetDatagridComponent } from './fishing-spot/fishing-spot-hookset-datagrid/fishing-spot-hookset-datagrid.component';
import { AlarmButtonModule } from '../../modules/alarm-button/alarm-button.module';

const routes: Routes = [
  {
    path: ':language',
    component: DbComponent,
    children: [
      {
        path: 'item/:itemId',
        component: ItemComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard],
        resolve: {
          client: ApolloClientResolver
        }
      },
      {
        path: 'item/:itemId/:slug',
        component: ItemComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard],
        resolve: {
          client: ApolloClientResolver
        }
      },

      {
        path: 'instance/:instanceId',
        component: InstanceComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'instance/:instanceId/:slug',
        component: InstanceComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'quest/:questId',
        component: QuestComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'quest/:questId/:slug',
        component: QuestComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'npc/:npcId',
        component: NpcComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'npc/:npcId/:slug',
        component: NpcComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'leve/:leveId',
        component: LeveComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'leve/:leveId/:slug',
        component: LeveComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'mob/:mobId',
        component: MobComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'mob/:mobId/:slug',
        component: MobComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'fate/:fateId',
        component: FateComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'fate/:fateId/:slug',
        component: FateComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'map/:mapId',
        component: MapPageComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'map/:mapId/:slug',
        component: MapPageComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'node/:nodeId',
        component: NodeComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'spearfishing-spot/:spotId',
        component: SpearfishingSpotComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'action/:actionId',
        component: ActionComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'action/:actionId/:slug',
        component: ActionComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'status/:statusId',
        component: StatusComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'status/:statusId/:slug',
        component: StatusComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'trait/:traitId',
        component: TraitComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'trait/:traitId/:slug',
        component: TraitComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'achievement/:achievementId',
        component: AchievementComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'achievement/:achievementId/:slug',
        component: AchievementComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'patch/:patchId',
        component: PatchComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'patch/:patchId/:slug',
        component: PatchComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },

      {
        path: 'fishing-spot/:spotId',
        component: FishingSpotComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard],
        resolve: {
          client: ApolloClientResolver
        }
      },
      {
        path: 'fishing-spot/:spotId/:slug',
        component: FishingSpotComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard],
        resolve: {
          client: ApolloClientResolver
        }
      }
    ]
  }
];

@NgModule({
  declarations: [
    DbComponent,
    InstanceComponent,
    ItemComponent,
    QuestComponent,
    NpcComponent,
    LeveComponent,
    MobComponent,
    FateComponent,
    MapPageComponent,
    NodeComponent,
    SpearfishingSpotComponent,
    ActionComponent,
    StatusComponent,
    TraitComponent,
    ModelViewerComponent,
    DbCommentsComponent,
    CommentLinksPipe,
    AchievementComponent,
    PatchComponent,
    FishComponent,
    FishingSpotComponent,
    FishingMissesPopupComponent,
    FishHoursComponent,
    FishBaitsComponent,
    FishHooksetsComponent,
    FishSpotsListComponent,
    FishBiteTimesComponent,
    FishWeathersComponent,
    FishWeatherTransitionsComponent,
    FishMoochesComponent,
    FishTopUsersComponent,
    FishUserRankingComponent,
    FishDetailsContainerComponent,
    FishingSpotHoursComponent,
    FishingSpotBiteTimesComponent,
    FishingSpotPositionComponent,
    FishingSpotWeathersComponent,
    FishingSpotWeatherTransitionsComponent,
    FishingSpotAvailableFishesComponent,
    FishingSpotDatagridComponent,
    FishingSpotBaitDatagridComponent,
    FishingSpotWeatherDatagridComponent,
    FishingSpotTugDatagridComponent,
    FishingSpotHooksetDatagridComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreModule,
    FlexLayoutModule,
    FormsModule,
    TranslateModule,
    NgxChartsModule,
    MapModule,
    PipesModule,
    ItemIconModule,
    AlarmsModule,
    PageLoaderModule,
    FullpageMessageModule,
    FishingBaitModule,
    TooltipModule,
    ListModule,
    RotationsModule,
    ItemDetailsPopupsModule,
    I18nDisplayModule,
    MarketboardModule,
    AntdSharedModule,
    UserAvatarModule,
    QuickSearchModule,
    NzStatisticModule,
    NzCommentModule,
    NzAvatarModule,
    LazyScrollModule,
    ChartModule,
    FishDataModule,
    AlarmButtonModule
  ],
  providers: [ItemContextService]
})
export class DbModule {
}
