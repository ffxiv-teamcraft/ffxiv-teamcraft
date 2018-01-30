import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../../model/list/list';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {UserInfo} from 'firebase/app';
import {ListManagerService} from '../../../core/list/list-manager.service';
import {ListService} from '../../../core/database/list.service';
import {Observable} from 'rxjs/Observable';
import {MathTools} from '../../../tools/math-tools';
import {Title} from '@angular/platform-browser';
import {AlarmService} from '../../../core/time/alarm.service';
import {ComponentWithSubscriptions} from '../../../core/component/component-with-subscriptions';
import {ListTag} from '../../../model/list/list-tag.enum';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MergeListsPopupComponent} from '../merge-lists-popup/merge-lists-popup.component';
import {BulkRegeneratePopupComponent} from '../bulk-regenerate-popup/bulk-regenerate-popup.component';

declare const ga: Function;

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.scss']
})
export class ListsComponent extends ComponentWithSubscriptions implements OnInit {

    lists: Observable<List[]>;

    tags: string[] = Object.keys(ListTag);

    tagFilter: BehaviorSubject<string[]> = new BehaviorSubject([]);

    user: UserInfo;

    newListFormControl = new FormControl('', Validators.required);

    @ViewChild('f') myNgForm;

    expanded: string[] = [];

    constructor(private auth: AngularFireAuth, private alarmService: AlarmService,
                private dialog: MatDialog, private listManager: ListManagerService,
                private listService: ListService, private title: Title, private cd: ChangeDetectorRef) {
        super();
    }

    createNewList(): void {
        if (this.newListFormControl.valid) {
            const list = new List();
            list.name = this.newListFormControl.value;
            list.authorId = this.user.uid;
            this.listService.add(list).first().subscribe(() => {
                this.newListFormControl.reset();
                this.myNgForm.resetForm();
            });
        }
    }

    regenerateAllLists(): void {
        this.lists.first().subscribe(lists => {
            this.dialog.open(BulkRegeneratePopupComponent, {data: lists, disableClose: true});
        });
    }

    closed(key: string): void {
        this.expanded = this.expanded.filter(i => i !== key);
    }

    opened(key: string): void {
        this.expanded.push(key);
    }

    delete(list: List): void {
        const dialogRef = this.dialog.open(ConfirmationPopupComponent);
        this.subscriptions.push(dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.cd.detach();
                list.forEachItem(row => {
                    if (this.alarmService.hasAlarm(row)) {
                        this.alarmService.unregister(row.id);
                    }
                });
                this.listService.remove(list.$key).first().subscribe(() => {
                    ga('send', 'event', 'List', 'deletion');
                    this.cd.reattach();
                    this.title.setTitle('Teamcraft');
                });
            }
        }));
    }

    openMergeListsPopup(): void {
        this.lists.first().subscribe(lists => {
            this.dialog.open(MergeListsPopupComponent, {data: {lists: lists, authorId: this.user.uid}}).afterClosed();
        })
    }

    removeRecipe(recipe: any, list: List, key: string): void {
        this.cd.detach();
        this.subscriptions.push(this.listManager
            .addToList(recipe.id, list, recipe.recipeId, -recipe.amount)
            .subscribe(resultList => {
                this.listService.set(key, resultList);
                this.cd.reattach();
            }));
    }

    updateAmount(recipe: any, list: List, key: string, amount: number): void {
        this.cd.detach();
        this.subscriptions.push(this.listManager
            .addToList(recipe.id, list, recipe.recipeId, MathTools.round(amount - recipe.amount))
            .subscribe(resultList => {
                this.listService.set(key, resultList);
                this.cd.reattach();
            }));
    }

    ngOnInit() {
        this.subscriptions.push(
            this.auth.authState.subscribe(user => {
                if (user === null) {
                    this.lists = Observable.of([]);
                    this.user = undefined;
                } else {
                    this.user = user;
                    this.lists = Observable.combineLatest(this.listService.getUserLists(user.uid), this.tagFilter, (lists, tagFilter) => {
                        if (tagFilter.length === 0) {
                            return lists;
                        }
                        return lists.filter(list => {
                            let match = true;
                            tagFilter.forEach(tag => {
                                match = match && list.tags.indexOf(ListTag[tag]) > -1;
                            });
                            return match;
                        });
                    });
                }
            }));
    }

}
