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

@Component({
    selector: 'app-workshop',
    templateUrl: './workshop.component.html',
    styleUrls: ['./workshop.component.scss']
})
export class WorkshopComponent implements OnInit {

    workshop: Observable<Workshop>;

    lists: Observable<List[]>;

    author: Observable<any>;

    constructor(private route: ActivatedRoute, private workshopService: WorkshopService, private listService: ListService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.workshop = this.route.params.mergeMap(params => this.workshopService.get(params.id));
        this.lists = this.workshop.mergeMap(workshop => Observable.combineLatest(...workshop.listIds.map(id => this.listService.get(id))));
        this.author = this.workshop.mergeMap(workshop => this.userService.getCharacter(workshop.authorId))
    }

    trackByListsFn(index: number, item: List) {
        return item.$key;
    }

}
