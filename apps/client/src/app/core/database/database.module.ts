import { NgModule } from '@angular/core';
import { ListService } from '../../modules/list/list.service';
import { UserService } from './user.service';
import { ListStore } from './storage/list/list-store';
import { DiffService } from './diff/diff.service';
import { FirestoreListStorage } from './storage/list/firestore-list-storage';
import { ListTemplateService } from './list-template/list-template.service';
import { CraftingRotationService } from './crafting-rotation.service';
import { CommissionService } from './commission/commission.service';
import { TeamService } from './team.service';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { WorkshopService } from './workshop.service';


@NgModule({
  imports: [
    AngularFirestoreModule
  ],
  providers: [
    ListService,
    WorkshopService,
    UserService,
    { provide: ListStore, useClass: FirestoreListStorage },
    DiffService,
    ListTemplateService,
    CraftingRotationService,
    CommissionService,
    TeamService
  ]
})
export class DatabaseModule {
}
