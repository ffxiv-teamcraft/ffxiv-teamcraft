import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ListTemplateService} from '../../../core/database/list-template/list-template.service';
import {ListTemplate} from '../../../core/database/list-template/list-template';
import {Observable} from 'rxjs';
import {ListService} from '../../../core/database/list.service';
import {List} from '../../../model/list/list';
import {AppUser} from 'app/model/list/app-user';



@Component({
    selector: 'app-template',
    templateUrl: './template.component.html',
    styleUrls: ['./template.component.scss']
})
export class TemplateComponent implements OnInit {

    notFound = false;

    template$: Observable<List>;

    constructor(private activeRoute: ActivatedRoute, private userService: UserService, private templateService: ListTemplateService,
                private listService: ListService, private router: Router) {
    }

    ngOnInit() {
        this.template$ = this.activeRoute.params.switchMap(params => {
            return this.templateService.getByUriAndNickname(decodeURI(params.uri), decodeURI(params.nickName));
        }).mergeMap((template: ListTemplate) => {
            if (template === undefined) {
                return Observable.of(null);
            } else {
                return this.listService.get(template.originalListId);
            }
        }).do(res => {
            if (res === null) {
                this.notFound = true;
            }
        }).filter(res => res !== null && res !== undefined);

        // Adding artificial delay to give time to the user so he can read the notice
        Observable
            .zip(this.userService.getUserData(), this.template$, (user: AppUser, list: List) => {
                const clone = list.clone();
                clone.authorId = user.$key;
                return clone;
            })
            .mergeMap(clone => this.listService.add(clone))
            .delay(3000)
            .subscribe((uid) => {
                this.router.navigate(['/list', uid]);
            });
    }
}
