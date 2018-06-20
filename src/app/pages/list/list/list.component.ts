import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {PageComponent} from '../../../core/component/page-component';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {MatDialog} from '@angular/material';
import {HelpService} from '../../../core/component/help.service';
import {ComponentType} from '@angular/cdk/portal';
import {ListHelpComponent} from '../list-help/list-help.component';
import {List} from '../../../model/list/list';
import {ActivatedRoute} from '@angular/router';
import {ListService} from '../../../core/database/list.service';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {ObservableMedia} from '@angular/flex-layout';
import {UserService} from '../../../core/database/user.service';
import {catchError, filter, mergeMap, switchMap, tap} from 'rxjs/operators';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent extends PageComponent implements OnInit, OnDestroy {

    public reload$: BehaviorSubject<void> = new BehaviorSubject<void>(null);

    public list: Observable<List>;

    public notFound = false;

    constructor(protected dialog: MatDialog, help: HelpService, private route: ActivatedRoute,
                private listService: ListService, private title: Title, private translate: TranslateService,
                private data: LocalizedDataService, protected media: ObservableMedia, private userService: UserService) {
        super(dialog, help, media);
    }

    ngOnDestroy(): void {
        this.title.setTitle('Teamcraft');
        super.ngOnDestroy();
    }

    ngOnInit() {
        super.ngOnInit();
        this.list = this.route.params.pipe(
            switchMap(params => {
                return this.userService.getUserData().pipe(
                    mergeMap(user => {
                        return this.reload$
                            .pipe(
                                mergeMap(() => this.listService.get(params.listId)),
                                tap(list => {
                                    this.notFound = !list.getPermissions(user.$key).read;
                                }),
                                filter(list => list !== null),
                                tap((l: List) => {
                                    if (!this.notFound && l.name !== undefined) {
                                        this.title.setTitle(`${l.name}`);
                                    } else {
                                        this.title.setTitle(this.translate.instant('List_not_found'));
                                    }
                                }),
                                map((list: List) => {
                                    list.crystals = list.orderCrystals();
                                    list.gathers = list.orderGatherings(this.data);
                                    return list;
                                }),
                                catchError(() => {
                                    this.notFound = true;
                                    return of(null);
                                })
                            );
                    }));
            }));
    }


    getHelpDialog(): ComponentType<any> | TemplateRef<any> {
        return ListHelpComponent;
    }

}
