import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Character } from '@xivapi/angular-client';
import { EMPTY, Observable } from 'rxjs';
import { LodestoneService } from '../../../core/api/lodestone.service';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';
import { List } from '../../../modules/list/model/list';
import { TeamcraftUser } from '../../../model/user/teamcraft-user';
import { AuthFacade } from '../../../+state/auth.facade';
import { UserService } from '../../../core/database/user.service';
import { GearSet } from '@ffxiv-teamcraft/simulator';
import { CraftingRotation } from '../../../model/other/crafting-rotation';
import { CraftingRotationService } from '../../../core/database/crafting-rotation/crafting-rotation.service';
import { FirestoreListStorage } from '../../../core/database/storage/list/firestore-list-storage';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { TranslateService } from '@ngx-translate/core';

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

  public fishingRankings$: Observable<any>;

  public notFound = false;

  public now = Math.floor(Date.now() / 1000);

  constructor(private route: ActivatedRoute, private characterService: LodestoneService,
              private listsService: FirestoreListStorage, private authFacade: AuthFacade,
              private userService: UserService, private craftingRotationsService: CraftingRotationService,
              private apollo: Apollo, public translate: TranslateService) {
    const userId$ = this.route.paramMap.pipe(
      map(params => params.get('userId')),
      shareReplay(1)
    );
    this.characterEntry$ = userId$.pipe(
      switchMap(userId => this.characterService.getUserCharacter(userId)),
      catchError(() => {
        this.notFound = true;
        return EMPTY;
      })
    );
    this.user$ = userId$.pipe(switchMap(uid => this.userService.get(uid)), shareReplay(1));
    this.gearSets$ = this.user$.pipe(
      map(user => {
        const lodestoneId = user.defaultLodestoneId ? user.defaultLodestoneId : user.lodestoneIds[0].id;
        return user.lodestoneIds.find(entry => entry.id === lodestoneId)?.stats;
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
    this.fishingRankings$ = this.user$.pipe(
      switchMap(user => {
        return this.apollo.query<any>({
          query: gql`query userRankings {
            user_rankings:fishingresults(where:{userId: {_eq: "${user.$key}"}, ranking: { rank: {_lte: 3}}, itemId: {_gt: 0}}) {
                size,
                date,
                itemId,
                baitId,
                ranking {
                  rank
                }
            }
          }`,
          fetchPolicy: 'no-cache'
        });
      }),
      map(result => {
        const dataDisplay = result.data.user_rankings
          .reduce((display, row) => {
            const displayRow = display.find(dRow => {
              return dRow.itemId === row.itemId;
            });
            if (displayRow && displayRow.ranking.rank <= row.ranking.rank) {
              display = display.filter(dRow => dRow.itemId !== row.itemId);
            }
            display.push(row);
            return display;
          }, [])
          .sort((a, b) => {
            return a.ranking.rank - b.ranking.rank;
          });
        return {
          summary: {
            1: dataDisplay.filter(row => row.ranking.rank === 1).length,
            2: dataDisplay.filter(row => row.ranking.rank === 2).length,
            3: dataDisplay.filter(row => row.ranking.rank === 3).length
          },
          data: dataDisplay
        };
      })
    );
  }

}
