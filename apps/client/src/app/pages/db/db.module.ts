import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DbComponent } from './db/db.component';
import { CoreModule } from '../../core/core.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MapModule } from '../../modules/map/map.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ItemIconModule } from '../../modules/item-icon/item-icon.module';
import { AlarmsModule } from '../../core/alarms/alarms.module';
import { PageLoaderModule } from '../../modules/page-loader/page-loader.module';
import { FullpageMessageModule } from '../../modules/fullpage-message/fullpage-message.module';
import { FishingBaitModule } from '../../modules/fishing-bait/fishing-bait.module';
import { TooltipModule } from '../../modules/tooltip/tooltip.module';
import { ListModule } from '../../modules/list/list.module';
import { RotationsModule } from '../../modules/rotations/rotations.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ItemComponent } from './item/item.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
import { VersionLockGuard } from '../version-lock/version-lock.guard';
import { InstanceComponent } from './instance/instance.component';
import { QuestComponent } from './quest/quest.component';
import { NpcComponent } from './npc/npc.component';
import { LeveComponent } from './leve/leve.component';
import { MobComponent } from './mob/mob.component';
import { FateComponent } from './fate/fate.component';
import { MapPageComponent } from './map-page/map-page.component';
import { NodeComponent } from './node/node.component';
import { ActionComponent } from './action/action.component';
import { StatusComponent } from './status/status.component';
import { TraitComponent } from './trait/trait.component';
import { ModelViewerComponent } from './item/model-viewer/model-viewer.component';
import { MarketboardModule } from '../../modules/marketboard/marketboard.module';
import { DbCommentsComponent } from './db-comments/db-comments/db-comments.component';
import { UserAvatarModule } from '../../modules/user-avatar/user-avatar.module';
import { CommentLinksPipe } from './db-comments/comment-links.pipe';
import { AchievementComponent } from './achievement/achievement.component';
import { PatchComponent } from './patch/patch.component';
import { FishComponent } from './fish/fish.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FishingSpotComponent } from './fishing-spot/fishing-spot.component';
import { QuickSearchModule } from '../../modules/quick-search/quick-search.module';
import { ItemDetailsPopupsModule } from '../../modules/item-details/item-details-popups.module';

const routes: Routes = [
  {
    path: ':language',
    component: DbComponent,
    children: [
      {
        path: 'item/:itemId',
        component: ItemComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'item/:itemId/:slug',
        component: ItemComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
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
        canActivate: [MaintenanceGuard, VersionLockGuard]
      },
      {
        path: 'fishing-spot/:spotId/:slug',
        component: FishingSpotComponent,
        canActivate: [MaintenanceGuard, VersionLockGuard]
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
    ActionComponent,
    StatusComponent,
    TraitComponent,
    ModelViewerComponent,
    DbCommentsComponent,
    CommentLinksPipe,
    AchievementComponent,
    PatchComponent,
    FishComponent,
    FishingSpotComponent
  ],
  entryComponents: [ModelViewerComponent],
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
    MarketboardModule,

    NgZorroAntdModule,
    UserAvatarModule,
    QuickSearchModule
  ]
})
export class DbModule {
}
