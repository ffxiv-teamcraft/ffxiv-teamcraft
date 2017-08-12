import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {List} from '../model/list';
import {FormControl, Validators} from '@angular/forms';
import {MdDialog} from '@angular/material';
import {ConfirmationPopupComponent} from '../confirmation-popup/confirmation-popup.component';
import {UserInfo} from 'firebase/app';
import {ListManagerService} from '../core/list-manager.service';

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
                private dialog: MdDialog, private listManager: ListManagerService) {
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
        this.listManager.removeFromList(recipe, list);
        this.lists.update(key, list);
    }

    ngOnInit() {
        this.auth.idToken.subscribe(user => {
            this.user = user;
            this.lists = this.af.list(`/lists/${user.uid}`);
        });
    }

}
