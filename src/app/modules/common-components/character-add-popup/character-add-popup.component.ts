import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {Observable} from 'rxjs/Observable';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import 'rxjs/add/operator/catch';
import {UserService} from '../../../core/database/user.service';

@Component({
    selector: 'app-character-add-popup',
    templateUrl: './character-add-popup.component.html',
    styleUrls: ['./character-add-popup.component.scss']
})
export class CharacterAddPopupComponent implements OnInit {

    @ViewChild('name') nameInput: ElementRef;

    @ViewChild('server') serverInput: ElementRef;

    serverName = '';

    characterName: string;

    search: Observable<any[]>;

    loading = false;

    constructor(private data: DataService,
                private userService: UserService,
                public dialogRef: MatDialogRef<CharacterAddPopupComponent>,
                @Inject(MAT_DIALOG_DATA) public disconnectButton = false) {
    }

    select(id: number): void {
        this.userService.getUserData()
            .map(user => {
                if (user !== null && !user.anonymous) {
                    user.lodestoneId = id;
                    this.userService.update(user.$key, user);
                }
            }).subscribe(() => this.dialogRef.close());
    }

    logOut(): void {
        this.userService.signOut().subscribe(() => this.dialogRef.close());
    }

    ngOnInit(): void {
        // Create observables from navite input elements.
        const name$ = Observable.fromEvent(this.nameInput.nativeElement, 'keyup').debounceTime(250).map(() => this.characterName);
        const server$ = Observable.fromEvent(this.serverInput.nativeElement, 'keyup').debounceTime(250).map(() => this.serverName);
        // Combine them to observe the result.
        this.search = Observable.combineLatest(name$, server$)
            .do(() => this.loading = true)
            // Replace the Observable with a search query.
            .switchMap(data => {
                return this.data.searchCharacter(data[0], data[1]);
            })
            .do(() => this.loading = false)
    }
}
