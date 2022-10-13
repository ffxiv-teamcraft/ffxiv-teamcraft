import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkshopsFacade } from '../../../modules/workshop/+state/workshops.facade';
import { ListsFacade } from '../../../modules/list/+state/lists.facade';
import { Workshop } from '../../../model/other/workshop';
import { Observable, of } from 'rxjs';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { List } from '../../../modules/list/model/list';
import { Character, XivapiService } from '@xivapi/angular-client';
import { UserService } from '../../../core/database/user.service';
import { LodestoneService } from '../../../core/api/lodestone.service';

@Component({
  selector: 'app-workshop-details',
  templateUrl: './workshop-details.component.html',
  styleUrls: ['./workshop-details.component.less']
})
export class WorkshopDetailsComponent implements OnInit {

  public workshop$: Observable<Workshop>;

  public author$: Observable<Partial<Character>>;

  public lists$: Observable<List[]>;

  constructor(private route: ActivatedRoute, private workshopsFacade: WorkshopsFacade,
              private listsFacade: ListsFacade, private xivapi: XivapiService,
              private userService: UserService, private characterService: LodestoneService) {
    this.workshop$ = this.workshopsFacade.selectedWorkshop$.pipe(
      filter(w => w !== undefined),
      tap(workshop => {
        if (!workshop.notFound) {
          workshop.listIds.forEach(listId => this.listsFacade.load(listId));
        }
      })
    );

    this.lists$ = this.workshop$.pipe(
      filter(workshop => !workshop.notFound),
      switchMap(workshop => {
        return this.listsFacade.getWorkshopCompacts(workshop.listIds);
      }),
      map(lists => lists.filter(list => list !== undefined && !list.notFound))
    );

    this.author$ = this.workshop$.pipe(
      filter(workshop => !workshop.notFound),
      switchMap(workshop => {
        return this.userService.get(workshop.authorId).pipe(
          catchError(() => of(null))
        );
      }),
      switchMap(user => {
        if (user && user.defaultLodestoneId) {
          return this.characterService.getCharacter(user.defaultLodestoneId)
            .pipe(
              map(response => response.Character)
            );
        }
        return of({
          Name: 'COMMON.Anonymous'
        });
      })
    );

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter(key => key !== undefined),
      first()
    ).subscribe(key => {
      this.workshopsFacade.loadWorkshop(key);
      this.workshopsFacade.selectWorkshop(key);
    });
  }

}
