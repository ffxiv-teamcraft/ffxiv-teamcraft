import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Character } from '@xivapi/angular-client';
import { EMPTY, Observable } from 'rxjs';
import { CharacterService } from '../../../core/api/character.service';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { List } from '../../../modules/list/model/list';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AuthFacade } from '../../../+state/auth.facade';
import { UserService } from '../../../core/database/user.service';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { CraftingRotationService } from '../../../core/database/crafting-rotation/crafting-rotation.service';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.less']
})
export class PublicProfileComponent {

  public characterEntry$: Observable<{ character: Character, verified: boolean }>;

  public user$: Observable<TeamcraftUser>;

  public gearSets$: Observable<GearSet[]>;

  public communityLists$: Observable<List[]>;

  public communityRotations$: Observable<CraftingRotation[]>;

  notFound = false;

  now = Math.floor(Date.now() / 1000);

  constructor(private route: ActivatedRoute, private characterService: CharacterService,
              private listsService: FirestoreListStorage, private authFacade: AuthFacade,
              private userService: UserService, private craftingRotationsService: CraftingRotationService) {
    const userId$ = this.route.paramMap.pipe(
      map(params => params.get('userId')),
      shareReplay(1)
    );
    this.characterEntry$ = userId$.pipe(
      switchMap(userId => this.characterService.getCharacter(userId)),
      catchError(() => {
        this.notFound = true;
        return EMPTY;
      })
    );
    this.user$ = userId$.pipe(switchMap(uid => this.userService.get(uid)), shareReplay(1));
    this.gearSets$ = this.user$.pipe(
      map(user => {
        const lodestoneId = user.defaultLodestoneId ? user.defaultLodestoneId : user.lodestoneIds[0].id;
        return user.lodestoneIds.find(entry => entry.id === lodestoneId).stats;
      })
    );
    this.communityLists$ = userId$.pipe(
      switchMap(userId => {
        return this.listsService.getUserCommunityLists(userId);
      }),
      shareReplay(1)
    );
    this.communityRotations$ = userId$.pipe(
      switchMap(userId => {
        return this.craftingRotationsService.getUserCommunityRotations(userId);
      }),
      shareReplay(1)
    );
  }

}
