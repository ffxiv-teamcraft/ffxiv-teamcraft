import {Component} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {List} from '../../../model/list/list';
import {combineLatest, Observable, of} from 'rxjs';
import {ListService} from '../../../core/database/list.service';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {Workshop} from '../../../model/other/workshop';
import {WorkshopService} from '../../../core/database/workshop.service';
import {catchError, map, switchMap} from 'rxjs/operators';

@Component({
    selector: 'app-favorites',
    templateUrl: './favorites.component.html',
    styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent extends ComponentWithSubscriptions {

    favorites: Observable<List[]>;

    favoriteWorkshops: Observable<Workshop[]>;

    constructor(private userService: UserService, private listService: ListService, private workshopService: WorkshopService) {
        super();
        this.favorites = this.userService.getUserData()
            .pipe(
                switchMap(userData => {
                    const lists: Observable<List>[] = [];
                    (userData.favorites || []).forEach(fav => {
                        const favData = fav.split('/');
                        const authorUid = favData[0];
                        const listUid = favData[1];
                        lists.push(this.listService.get(listUid)
                            .pipe(
                                catchError(() => {
                                    // If there's an error, that's because the list doesn't exist anymore.
                                    return of(null);
                                })
                            ));
                    });
                    return combineLatest(lists);
                }),
                // We need to remove null rows in order to keep the display safe.
                map(favorites => favorites.filter(row => row !== null))
            );
        this.favoriteWorkshops = this.userService.getUserData()
            .pipe(
                switchMap(userData => {
                    return combineLatest((userData.favoriteWorkshops || []).map(favWs => this.workshopService.get(favWs)
                        .pipe(
                            catchError(() => {
                                return of(null);
                            }))
                    ));
                })
            );
    }
}
