import { NgModule } from '@angular/core';
import { CraftingRotationService } from './crafting-rotation/crafting-rotation.service';
import { TeamService } from './team.service';
import { WorkshopService } from './workshop.service';
import { TeamInviteService } from './team-invite.service';
import { CraftingRotationsFolderService } from './crafting-rotations-folder.service';
import { CustomLinksService } from './custom-links/custom-links.service';


@NgModule({
  providers: [
    WorkshopService,
    TeamInviteService,
    CustomLinksService,
    CraftingRotationService,
    CraftingRotationsFolderService,
    TeamService
  ]
})
export class DatabaseModule {
}
