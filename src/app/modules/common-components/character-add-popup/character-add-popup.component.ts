import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../core/api/data.service';
import {combineLatest, fromEvent, Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

import {UserService} from '../../../core/database/user.service';
import {debounceTime, first, map, switchMap, tap} from 'rxjs/operators';

@Component({
    selector: 'app-character-add-popup',
    templateUrl: './character-add-popup.component.html',
    styleUrls: ['./character-add-popup.component.scss']
})
export class CharacterAddPopupComponent implements OnInit {

    @ViewChild('name') nameInput: ElementRef;

    @ViewChild('server') serverInput: ElementRef;

    @ViewChild('lodestoneIdInput') lodestoneIdInput: ElementRef;

    serverName = '';

    characterName: string;

    lodestoneId: string;

    search: Observable<any[]>;

    characterFromLodestone$: Observable<any>;

    loading = false;

    customId = false;

    constructor(private data: DataService,
                private userService: UserService,
                public dialogRef: MatDialogRef<CharacterAddPopupComponent>,
                @Inject(MAT_DIALOG_DATA) public disconnectButton = false) {
    }

    select(id: number): void {
        this.userService.getUserData()
            .pipe(
                first(),
                map(user => {
                    if (user !== null && !user.anonymous) {
                        user.lodestoneId = id;
                        this.userService.update(user.$key, user);
                    }
                })
            ).subscribe(() => this.dialogRef.close());
    }

    logOut(): void {
        this.userService.signOut().subscribe(() => this.dialogRef.close());
    }

    ngOnInit(): void {
        // Create observables from navite input elements.
        const name$ = fromEvent(this.nameInput.nativeElement, 'keyup')
            .pipe(
                debounceTime(250),
                map(() => this.characterName)
            );
        const server$ = fromEvent(this.serverInput.nativeElement, 'keyup')
            .pipe(
                debounceTime(250),
                map(() => this.serverName)
            );
        this.characterFromLodestone$ = fromEvent(this.lodestoneIdInput.nativeElement, 'keyup')
            .pipe(
                debounceTime(250),
                map(() => this.lodestoneId),
                tap(() => this.loading = true),
                switchMap(lodestoneId => {
                    return this.data.getCharacter(+lodestoneId).pipe(
                        map(res => res.name === 'Lodestone under maintenance' ? null : res)
                    );
                }),
                tap(() => this.loading = false)
            );
        // Combine them to observe the result.
        this.search = combineLatest(name$, server$)
            .pipe(
                tap(() => this.loading = true),
                // Replace the Observable with a search query.
                switchMap(data => {
                    return this.data.searchCharacter(data[0], data[1]);
                }),
                tap(() => this.loading = false)
            );
    }
}
