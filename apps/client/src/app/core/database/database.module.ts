import { NgModule } from '@angular/core';
import { ListService } from '../../modules/list/list.service';
import { UserService } from './user.service';
import { ListStore } from './storage/list/list-store';
import { FirestoreListStorage } from './storage/list/firestore-list-storage';
import { ListTemplateService } from './list-template/list-template.service';
import { CraftingRotationService } from './crafting-rotation.service';
import { TeamService } from './team.service';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { WorkshopService } from './workshop.service';
import { TeamInviteService } from './team-invite.service';
import { CraftingRotationsFolderService } from './crafting-rotations-folder.service';


@NgModule({
  imports: [
    AngularFirestoreModule
  ],
  providers: [
    ListService,
    WorkshopService,
    UserService,
    TeamInviteService,
    { provide: ListStore, useClass: FirestoreListStorage },
    ListTemplateService,
    CraftingRotationService,
    CraftingRotationsFolderService,
    TeamService
  ]
})
export class DatabaseModule {
}
