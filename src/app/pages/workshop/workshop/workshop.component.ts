import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Workshop} from '../../../model/other/workshop';
import {combineLatest, Observable, of} from 'rxjs';
import {List} from '../../../model/list/list';
import {WorkshopService} from '../../../core/database/workshop.service';
import {ListService} from '../../../core/database/list.service';


import {UserService} from '../../../core/database/user.service';
import {catchError, first, map, mergeMap, switchMap, tap} from 'rxjs/operators';


@Component({
    selector: 'app-workshop',
    templateUrl: './workshop.component.html',
    styleUrls: ['./workshop.component.scss']
})
export class WorkshopComponent implements OnInit {

    workshop: Observable<Workshop>;

    lists: Observable<List[]>;

    author: Observable<any>;

    favorite: Observable<boolean>;

    notFound = false;

    constructor(private route: ActivatedRoute, private workshopService: WorkshopService, private listService: ListService,
                private userService: UserService) {
    }

    toggleFavorite(workshop: Workshop): void {
        this.userService.getUserData()
            .pipe(
                first(),
                map(appUser => {
                    if (appUser.favoriteWorkshops === undefined) {
                        appUser.favoriteWorkshops = [];
                    }
                    if (appUser.favoriteWorkshops.indexOf(workshop.$key) > -1) {
                        appUser.favoriteWorkshops = appUser.favoriteWorkshops.filter(ws => ws !== workshop.$key);
                    } else {
                        appUser.favoriteWorkshops.push(workshop.$key);
                    }
                    return appUser;
                }),
                switchMap(appUser => this.userService.set(appUser.$key, appUser))
            ).subscribe();
    }

    ngOnInit() {
        this.workshop = this.userService.getUserData()
            .pipe(
                mergeMap(user => this.userService.getCharacter(user.$key)
                    .pipe(
                        catchError(() => of(user)),
                        map(char => {
                            char.$key = user.$key;
                            return char;
                        }))
                ),
                mergeMap(character => {
                    return this.route.params
                        .pipe(
                            mergeMap(params => this.workshopService.get(params.id)),
                            tap(workshop => {
                                this.notFound = !workshop.getPermissions(character.$key, character.free_company).read;
                            }),
                            catchError(() => {
                                this.notFound = true;
                                return of(null);
                            })
                        );
                })
            );
        this.favorite = this.workshop
            .pipe(
                switchMap(workshop => {
                    return this.userService.getUserData()
                        .pipe(
                            map(user => {
                                return (user.favoriteWorkshops || []).indexOf(workshop.$key) > -1;
                            })
                        );
                })
            );
        this.lists = this.workshop
            .pipe(
                mergeMap(workshop =>
                    combineLatest(...workshop.listIds
                        .map(id =>
                            this.listService.get(id)
                                .pipe(catchError(() => of(null)))
                        )
                    )
                ),
                map(lists => lists.filter(l => l !== null))
            );
        this.author = this.workshop
            .pipe(
                mergeMap(workshop => this.userService.getCharacter(workshop.authorId)),
                catchError(() => of(null))
            );
    }

    trackByListsFn(index: number, item: List) {
        return item.$key;
    }

}
