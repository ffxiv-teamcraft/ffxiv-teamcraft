import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {fromEvent} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, first, map, mergeMap} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {combineLatest, of} from 'rxjs/index';

@Component({
    selector: 'app-user-selection-popup',
    templateUrl: './user-selection-popup.component.html',
    styleUrls: ['./user-selection-popup.component.scss']
})
export class UserSelectionPopupComponent implements OnInit {

    @ViewChild('inputField')
    inputField: ElementRef;

    // Here we store the result character
    public result: any;

    public notFound = false;

    public input: string;

    public loading = false;

    public contacts$: Observable<any[]>;

    constructor(private userService: UserService) {
        // this.contacts$ = userService.getUserData()
        //     .pipe(
        //         mergeMap(user => {
        //             return combineLatest(
        //                 user.contacts.map(contactId => {
        //                     return this.userService.getCharacter(contactId)
        //                         .pipe(
        //                             map(details => {
        //                                 details.$key = contactId;
        //                                 return details;
        //                             }),
        //                             catchError(() => {
        //                                 return of(null);
        //                             })
        //                         );
        //                 })
        //             ).pipe(map(res => res.filter(row => row !== null)));
        //         })
        //     )
    }

    private doSearch(): void {
        // this.loading = true;
        // // If this is an email
        // if (this.input.indexOf('@') > -1) {
        //     this.userService.getUserByEmail(this.input)
        //         .pipe(
        //             first(),
        //             mergeMap(user => this.userService.getCharacter(user.$key)
        //                 .pipe(map(character => ({character: character, user: user}))))
        //         )
        //         .subscribe(data => {
        //             this.notFound = false;
        //             this.result = data;
        //             this.loading = false;
        //         }, err => {
        //             this.notFound = true;
        //             this.loading = false;
        //         });
        // } else {
        //     // Else, handle it as a user id
        //     this.userService.get(this.input)
        //         .pipe(
        //             first(),
        //             mergeMap(user => this.userService.getCharacter(user.$key)
        //                 .pipe(map(character => ({character: character, user: user}))))
        //         )
        //         .subscribe(data => {
        //             this.notFound = false;
        //             this.result = data;
        //             this.loading = false;
        //         }, err => {
        //             this.notFound = true;
        //             this.loading = false;
        //         });
        // }
    }

    public ngOnInit(): void {
        fromEvent(this.inputField.nativeElement, 'keyup')
            .pipe(
                debounceTime(500),
                distinctUntilChanged()
            )
            .subscribe(() => this.doSearch());
    }

}
