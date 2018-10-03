import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataService} from '../../../core/api/data.service';
import {List} from '../../../model/list/list';
import {ListService} from '../../../core/database/list.service';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {TranslateService} from '@ngx-translate/core';
import {LocalizedDataService} from '../../../core/data/localized-data.service';
import {UserService} from '../../../core/database/user.service';
import {I18nToolsService} from '../../../core/tools/i18n-tools.service';
import {map, mergeMap} from 'rxjs/operators';

declare const gtag: Function;

@Component({
    selector: 'app-add-item',
    templateUrl: './add-item.component.html',
    styleUrls: ['./add-item.component.scss']
})
export class AddItemComponent implements OnInit {

    constructor(private route: ActivatedRoute, private dataService: DataService,
                private listService: ListService, private listManager: ListManagerService,
                private i18n: I18nToolsService, private translator: TranslateService,
                private localizedData: LocalizedDataService, private router: Router, private userService: UserService) {
    }

    ngOnInit() {
        this.route.params
            .pipe(
                map(params => {
                    const rawImportString = params.importString;
                    const decoded = atob(rawImportString);
                    return decoded.split(',');
                }),
                mergeMap(parsed => {
                    return this.dataService.getItem(+parsed[0])
                        .pipe(
                            map(item => ({item: item, parsed: parsed}))
                        );
                }),
                mergeMap(result => {
                    const list = new List();
                    list.name = this.i18n.getName(this.localizedData.getItem(+result.parsed[0]));
                    list.ephemeral = true;
                    // TODO implement quantity handling (has to be added in string sent by xivdb.
                    return this.listManager.addToList(+result.parsed[0], list, result.parsed[1], 1)
                        .pipe(
                            mergeMap((l) => {
                                return this.userService.getUserData()
                                    .pipe(
                                        map(u => {
                                            l.authorId = u.$key;
                                            return l;
                                        })
                                    );
                            }),
                            mergeMap(quickList => {
                                return this.listService.add(quickList)
                                    .pipe(
                                        map(uid => {
                                            list.$key = uid;
                                            return list;
                                        })
                                    );
                            })
                        )
                })
            ).subscribe((l) => {
            gtag('send', 'event', 'List', 'creation');
            this.listService.getRouterPath(l.$key).subscribe(path => {
                this.router.navigate(path);
            });
        });
    }

}
