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

    alreadyUsed = false;

    constructor(private data: DataService,
                private fb: FormBuilder,
                private firebase: AngularFireDatabase,
                private af: AngularFireAuth,
                public dialogRef: MdDialogRef<CharacterAddPopupComponent>) {
    }

    validateData(group: FormGroup): Observable<any> {
        return this.data
            .searchCharacter(group.controls.character.value, group.controls.server.value)
            .catch(() => {
                return Observable.of([]);
            }).map(result => {
                if (result.length !== 1) {
                    return {invalid: true};
                } else {
                    return null;
                }
            });
    }

    submit(): void {
        this.data
            .searchCharacter(this.form.value.character, this.form.value.server)
            .mergeMap(results => {
                return this.af.idToken.mergeMap(user => {
                    return Observable.fromPromise(this.firebase.database.ref(`/users`)
                        .orderByChild('lodestoneId')
                        .equalTo(results[0].id.toString())
                        .once('value').then(res => {
                            console.log(res.val());
                            if (res.val() === null) {
                                this.alreadyUsed = false;
                                if (user !== null) {
                                    return this.firebase.database.ref(`/users/${user.uid}/lodestoneId`)
                                        .set(results[0].id);
                                }
                            } else {
                                this.alreadyUsed = true;
                            }
                        }));
                });
            }).subscribe(() => {
            if (!this.alreadyUsed) {
                this.dialogRef.close();
            }
        });
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            character: ['', Validators.required],
            server: ['', Validators.required],
        }, {asyncValidator: this.validateData.bind(this)});
    }
}
