import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Workshop} from '../../../model/other/workshop';
import {Observable} from 'rxjs/Observable';
import {List} from '../../../model/list/list';
import {WorkshopService} from '../../../core/database/workshop.service';
import {ListService} from '../../../core/database/list.service';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/combineLatest';
import {UserService} from '../../../core/database/user.service';
import 'rxjs/add/observable/empty';

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
        this.userService.getUserData().first()
            .map(appUser => {
                if (appUser.favoriteWorkshops === undefined) {
                    appUser.favoriteWorkshops = [];
                }
                if (appUser.favoriteWorkshops.indexOf(workshop.$key) > -1) {
                    appUser.favoriteWorkshops = appUser.favoriteWorkshops.filter(ws => ws !== workshop.$key);
                } else {
                    appUser.favoriteWorkshops.push(workshop.$key);
                }
                return appUser;
            })
            .switchMap(appUser => this.userService.set(appUser.$key, appUser))
            .subscribe();
    }

    ngOnInit() {
        this.workshop = this.userService.getUserData()
            .mergeMap(user => this.userService.getCharacter(user.$key)
                .catch(() => Observable.of(user))
                .map(char => {
                    char.$key = user.$key;
                    return char;
                }))
            .mergeMap(character => {
                return this.route.params
                    .mergeMap(params => this.workshopService.get(params.id))
                    .do(workshop => {
                        this.notFound = !workshop.getPermissions(character.$key, character.free_company).read;
                    })
                    .catch(() => {
                        this.notFound = true;
                        return Observable.of(null);
                    });
            });
        this.favorite = this.workshop.switchMap(workshop => {
            return this.userService.getUserData().map(user => {
                return (user.favoriteWorkshops || []).indexOf(workshop.$key) > -1;
            });
        });
        this.lists = this.workshop
            .mergeMap(workshop =>
                Observable.combineLatest(...workshop.listIds
                    .map(id =>
                        this.listService.get(id)
                            .catch((notfound) => Observable.of(null))
                    )
                )
            ).map(lists => lists.filter(l => l !== null));
        this.author = this.workshop.mergeMap(workshop => this.userService.getCharacter(workshop.authorId))
            .catch(() => Observable.of(null));
    }

    trackByListsFn(index: number, item: List) {
        return item.$key;
    }

}
