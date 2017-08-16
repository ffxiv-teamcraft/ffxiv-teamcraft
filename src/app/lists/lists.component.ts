import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../model/list';
import {FormControl, Validators} from '@angular/forms';
import {MdDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../confirmation-popup/confirmation-popup.component';
import {UserInfo} from 'firebase/app';
import {ListManagerService} from '../core/list-manager.service';
import {I18nTools} from '../core/i18n-tools';
import {I18nName} from '../model/i18n-name';

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {

    lists: FirebaseListObservable<List[]>;

    user: UserInfo;

    newListFormControl = new FormControl('', Validators.required);

    constructor(private af: AngularFireDatabase, private auth: AngularFireAuth,
                private dialog: MdDialog, private listManager: ListManagerService,
                private i18n: I18nTools) {
    }

    createNewList(): void {
        if (this.newListFormControl.valid) {
            const list = new List();
            list.name = this.newListFormControl.value;
            this.lists.push(list);
            this.newListFormControl.reset();
        }
    }

    delete(listKey: string): void {
        const dialogRef = this.dialog.open(ConfirmationPopupComponent);
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.lists.remove(listKey);
            }
        });
    }

    removeRecipe(recipe: any, list: List, key: string): void {
        this.listManager.addToList(recipe.recipeId, list, -recipe.amount)
            .subscribe(resultList => this.lists.update(key, resultList));
    }

    updateAmount(recipe: any, list: List, key: string, amount: number): void {
        this.listManager.addToList(recipe.recipeId, list, amount - recipe.amount)
            .subscribe(resultList => this.lists.update(key, resultList));
    }

    public getName(i18nName: I18nName): string {
        return this.i18n.getName(i18nName);
    }

    ngOnInit() {
        this.auth.idToken.subscribe(user => {
            this.user = user;
            this.lists = this.af.list(`/lists/${user.uid}`);
        });
    }

}
