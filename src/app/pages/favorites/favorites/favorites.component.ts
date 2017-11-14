import {Component} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {List} from '../../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {ListService} from '../../../core/database/list.service';

@Component({
    selector: 'app-favorites',
    templateUrl: './favorites.component.html',
    styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent {

    favorites: { authorUid: string, list: List }[];

    constructor(private userService: UserService, private listService: ListService) {
        this.userService.getUserData()
            .switchMap(userData => {
                const lists: Observable<{ authorUid: string, list: List }>[] = [];
                (userData.favorites || []).forEach(fav => {
                    const favData = fav.split('/');
                    const authorUid = favData[0];
                    const listUid = favData[1];
                    lists
                        .push(this.listService.get(listUid)
                        .map(list => {
                            list.$key = listUid;
                            return {authorUid: authorUid, list: list};
                        }));
                });
                return Observable.combineLatest(lists);
            })
            .subscribe(favs => this.favorites = favs);
    }
}
