import {Component} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../../core/database/user.service';
import {List} from '../../../model/list/list';
import {ListService} from '../../../core/database/list.service';

@Component({
    selector: 'app-public-profile',
    templateUrl: './public-profile.component.html',
    styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent {

    public ingameCharacter: Observable<any>;

    public freeCompany: Observable<any>;

    public publicLists: Observable<List[]>;

    constructor(route: ActivatedRoute, dataService: DataService, userService: UserService, listService: ListService) {
        this.ingameCharacter = route.params.mergeMap(params => userService.get(params.id))
            .mergeMap(user => dataService.getCharacter(user.lodestoneId));
        this.freeCompany = this.ingameCharacter.mergeMap(character => dataService.getFreeCompany(character.free_company));
        this.publicLists = route.params.mergeMap(params => listService.getPublicListsByAuthor(params.id));
    }
}
