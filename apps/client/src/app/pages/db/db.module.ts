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
import { ItemDetailsPopupsModule } from '../list-details/item-details/item-details-popups.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ItemComponent } from './item/item.component';
import { MaintenanceGuard } from '../maintenance/maintenance.guard';
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

const routes: Routes = [
  {
    path: ':language',
    component: DbComponent,
    children: [
      {
        path: 'item/:itemId',
        component: ItemComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'item/:itemId/:slug',
        component: ItemComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'instance/:instanceId',
        component: InstanceComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'instance/:instanceId/:slug',
        component: InstanceComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'quest/:questId',
        component: QuestComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'quest/:questId/:slug',
        component: QuestComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'npc/:npcId',
        component: NpcComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'npc/:npcId/:slug',
        component: NpcComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'leve/:leveId',
        component: LeveComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'leve/:leveId/:slug',
        component: LeveComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'mob/:mobId',
        component: MobComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'mob/:mobId/:slug',
        component: MobComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'fate/:fateId',
        component: FateComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'fate/:fateId/:slug',
        component: FateComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'map/:mapId',
        component: MapPageComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'map/:mapId/:slug',
        component: MapPageComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'node/:nodeId',
        component: NodeComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'action/:actionId',
        component: ActionComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'action/:actionId/:slug',
        component: ActionComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'status/:statusId',
        component: StatusComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'status/:statusId/:slug',
        component: StatusComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'trait/:traitId',
        component: TraitComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'trait/:traitId/:slug',
        component: TraitComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'achievement/:achievementId',
        component: AchievementComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'achievement/:achievementId/:slug',
        component: AchievementComponent,
        canActivate: [MaintenanceGuard]
      },

      {
        path: 'patch/:patchId',
        component: PatchComponent,
        canActivate: [MaintenanceGuard]
      },
      {
        path: 'patch/:patchId/:slug',
        component: PatchComponent,
        canActivate: [MaintenanceGuard]
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
    PatchComponent
  ],
  entryComponents: [ModelViewerComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),

    CoreModule,
    FlexLayoutModule,
    FormsModule,

    TranslateModule,

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
    UserAvatarModule
  ]
})
export class DbModule {
}
