import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {PageComponent} from '../../../core/component/page-component';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MatDialog} from '@angular/material';
import {HelpService} from '../../../core/component/help.service';
import {ComponentType} from '@angular/cdk/portal';
import {ListHelpComponent} from '../list-help/list-help.component';
import {List} from '../../../model/list/list';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute} from '@angular/router';
import {ListService} from '../../../core/database/list.service';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../../../core/data/localized-data.service';

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
                private data: LocalizedDataService) {
        super(dialog, help);
    }

    ngOnDestroy(): void {
        this.title.setTitle('Teamcraft');
        super.ngOnDestroy();
    }

    ngOnInit() {
        this.list = this.route.params.switchMap(params => {
            return this.reload$
                .mergeMap(() => this.listService.get(params.listId))
                .filter(list => list !== null)
                .do((l: List) => {
                    if (l.name !== undefined) {
                        this.title.setTitle(`${l.name}`);
                    } else {
                        this.title.setTitle(this.translate.instant('List_not_found'));
                    }
                })
                .map((list: List) => {
                    list.crystals = list.orderCrystals();
                    list.gathers = list.orderGatherings(this.data);
                    return list;
                })
                .catch(() => {
                    this.notFound = true;
                    return Observable.of(null);
                });
        });
    }


    getHelpDialog(): ComponentType<any> | TemplateRef<any> {
        return ListHelpComponent;
    }

}
