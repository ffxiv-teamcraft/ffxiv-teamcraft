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
import { ListCompactsService } from '../../../modules/list/list-compacts.service';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.less']
})
export class PublicProfileComponent {

  public characterEntry$: Observable<{ character: Character, verified: boolean }>;

  public user$: Observable<TeamcraftUser>;

  public communityLists$: Observable<List[]>;

  notFound = false;

  constructor(private route: ActivatedRoute, private characterService: CharacterService,
              private listCompactsService: ListCompactsService, private authFacade: AuthFacade, private userService: UserService) {
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
    this.user$ = userId$.pipe(switchMap(uid => this.userService.get(uid)));
    this.communityLists$ = userId$.pipe(
      switchMap(userId => {
        return this.listCompactsService.getUserCommunityLists(userId);
      }),
      shareReplay(1)
    );
  }

}
