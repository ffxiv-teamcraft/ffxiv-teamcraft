import {Component} from '@angular/core';
import {UserService} from '../../core/user.service';
import {List} from '../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {ListService} from '../../core/firebase/list.service';

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
                        .push(this.listService.getUserList(authorUid, listUid)
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
