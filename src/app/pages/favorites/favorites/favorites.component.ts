import {Component} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {List} from '../../../model/list/list';
import {Observable} from 'rxjs';
import {ListService} from '../../../core/database/list.service';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {Workshop} from '../../../model/other/workshop';
import {WorkshopService} from '../../../core/database/workshop.service';

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
            .switchMap(userData => {
                const lists: Observable<List>[] = [];
                (userData.favorites || []).forEach(fav => {
                    const favData = fav.split('/');
                    const authorUid = favData[0];
                    const listUid = favData[1];
                    lists.push(this.listService.get(listUid)
                        .catch(() => {
                            // If there's an error, that's because the list doesn't exist anymore.
                            return Observable.of(null);
                        })
                    );
                });
                return Observable.combineLatest(lists);
            })
            // We need to remove null rows in order to keep the display safe.
            .map(favorites => favorites.filter(row => row !== null));
        this.favoriteWorkshops = this.userService.getUserData().switchMap(userData => {
            return Observable.combineLatest((userData.favoriteWorkshops || []).map(favWs => this.workshopService.get(favWs).catch(() => {
                return Observable.of(null);
            })));
        });
    }
}
