import {Component, Inject} from '@angular/core';
import {AppUser} from '../../../model/list/app-user';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserService} from '../../../core/database/user.service';
import {first, mergeMap, shareReplay} from 'rxjs/operators';

@Component({
    selector: 'app-rating-popup',
    templateUrl: './rating-popup.component.html',
    styleUrls: ['./rating-popup.component.scss']
})
export class RatingPopupComponent {

    public rating: number;

    private currentUser$ = this.userService.getUserData()
        .pipe(
            first(),
            shareReplay()
        );

    constructor(@Inject(MAT_DIALOG_DATA) public data: AppUser, private userService: UserService,
                private ref: MatDialogRef<RatingPopupComponent>) {
        this.currentUser$.subscribe(currentUser => {
            // Default rating is 3, or you can edit the rating you already set previously.
            this.rating = data.ratings[currentUser.$key] || 3;
        });
    }

    /**
     * Transforms the rating of a user into an array of length between 1 and 5
     * @returns {number[]}
     */
    getRating(rating: number): 1 | 0 [] {
        const result = [];
        while (rating >= 1) {
            rating--;
            result.push(1);
        }
        while (result.length < 5) {
            result.push(0);
        }
        return result;
    }

    save(): void {
        this.currentUser$
            .pipe(
                mergeMap(currentUser => {
                    this.data.ratings[currentUser.$key] = this.rating;
                    return this.userService.set(this.data.$key, this.data);
                })
            )
            .subscribe(() => {
                this.ref.close();
            });
    }

}
