import {Component, OnInit, ViewChild} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../../model/list/list';
import {FormControl, Validators} from '@angular/forms';
import {MdDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../popup/confirmation-popup/confirmation-popup.component';
import {UserInfo} from 'firebase/app';
import {ListManagerService} from '../../core/list/list-manager.service';
import {ListService} from '../../core/firebase/list.service';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-lists',
    templateUrl: './lists.component.html',
    styleUrls: ['./lists.component.scss']
})
export class ListsComponent implements OnInit {

    lists: Observable<List[]>;

    user: UserInfo;

    newListFormControl = new FormControl('', Validators.required);

    @ViewChild('f') myNgForm;

    constructor(private auth: AngularFireAuth,
                private dialog: MdDialog, private listManager: ListManagerService,
                private listService: ListService) {
    }

    createNewList(): void {
        if (this.newListFormControl.valid) {
            const list = new List();
            list.name = this.newListFormControl.value;
            this.listService.push(list).then(() => {
                this.newListFormControl.reset();
                this.myNgForm.resetForm();
            });
        }
    }

    delete(listKey: string): void {
        const dialogRef = this.dialog.open(ConfirmationPopupComponent);
        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.listService.remove(listKey);
            }
        });
    }

    removeRecipe(recipe: any, list: List, key: string): void {
        this.listManager
            .addToList(recipe.id, list, recipe.recipeId, -recipe.amount)
            .subscribe(resultList => this.listService.update(key, resultList));
    }

    updateAmount(recipe: any, list: List, key: string, amount: number): void {
        this.listManager
            .addToList(recipe.id, list, recipe.recipeId, amount - recipe.amount)
            .subscribe(resultList => this.listService.update(key, resultList));
    }

    ngOnInit() {
        this.auth.idToken.subscribe(user => {
            if (user === null) {
                this.lists = null;
                this.user = undefined;
            } else {
                this.user = user;
                this.lists = this.listService.getAll();
            }
        });
    }

}
