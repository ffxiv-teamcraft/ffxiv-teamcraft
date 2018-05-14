import {Component} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {Observable, of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../../core/database/user.service';
import {List} from '../../../model/list/list';
import {ListService} from '../../../core/database/list.service';
import {ObservableMedia} from '@angular/flex-layout';
import {catchError, filter, mergeMap} from 'rxjs/operators';

@Component({
    selector: 'app-public-profile',
    templateUrl: './public-profile.component.html',
    styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent {

    public ingameCharacter: Observable<any>;

    public freeCompany: Observable<any>;

    public publicLists: Observable<List[]>;

    constructor(route: ActivatedRoute, dataService: DataService, userService: UserService, listService: ListService,
                private media: ObservableMedia) {
        this.ingameCharacter = route.params
            .pipe(
                mergeMap(params => userService.get(params.id)),
                mergeMap(user => dataService.getCharacter(user.lodestoneId)),
                catchError(() => of(1))
            );
        this.freeCompany = this.ingameCharacter
            .pipe(
                filter(val => val !== null),
                mergeMap(character => dataService.getFreeCompany(character.free_company))
            );
        this.publicLists = route.params.pipe(mergeMap(params => listService.getPublicListsByAuthor(params.id)));
    }

    isMobile(): boolean {
        return this.media.isActive('xs') || this.media.isActive('sm');
    }
}
