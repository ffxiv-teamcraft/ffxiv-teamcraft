import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {MdDialogRef} from '@angular/material';

@Component({
    selector: 'app-character-add-popup',
    templateUrl: './character-add-popup.component.html',
    styleUrls: ['./character-add-popup.component.scss']
})
export class CharacterAddPopupComponent implements OnInit {

    form: FormGroup;

    validateTimeout: any;

    constructor(private data: DataService,
                private fb: FormBuilder,
                private firebase: AngularFireDatabase,
                private af: AngularFireAuth,
                public dialogRef: MdDialogRef<CharacterAddPopupComponent>) {
    }

    validateData(group: FormGroup): Promise<any> {
        const delay = 300;
        clearTimeout(this.validateTimeout);
        return new Promise((resolve) => {
            this.validateTimeout = setTimeout(() => {
                return this.data
                    .searchCharacter(group.controls.character.value, group.controls.server.value)
                    .catch(() => {
                        return Observable.of([]);
                    }).subscribe(result => {
                        if (result.length !== 1) {
                            resolve({invalid: true});
                        } else {
                            resolve();
                        }
                    });
            }, delay);
        });
    }

    submit(): void {
        this.data
            .searchCharacter(this.form.value.character, this.form.value.server)
            .mergeMap(results => {
                return this.af.idToken.mergeMap(user => {
                    if (user !== null) {
                        return this.firebase.database.ref(`/users/${user.uid}/lodestoneId`)
                            .set(results[0].id);
                    }
                    return Observable.of(null);
                });
            }).subscribe(() => {
            this.dialogRef.close();
        });
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            character: ['', Validators.required],
            server: ['', Validators.required],
        }, {asyncValidator: this.validateData.bind(this)});
    }
}
