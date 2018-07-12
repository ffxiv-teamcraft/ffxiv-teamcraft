import {Component, Input} from '@angular/core';
import {AppUser} from '../../../model/list/app-user';

@Component({
    selector: 'app-rating',
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.scss']
})
export class RatingComponent {

    @Input()
    public character: any;

    @Input()
    public displayAvatar = true;

    /**
     * Transforms the rating of a user into an array of length between 1 and 5
     * @param {AppUser} user
     * @returns {any[]}
     */
    getStars(user: AppUser): 1 | 0.5 | 0 [] {
        let rating = user.rating;
        const result = [];
        while (rating >= 1) {
            rating--;
            result.push(1);
        }
        if (rating >= 0.5) {
            result.push(0.5);
        }
        while (result.length < 5) {
            result.push(0);
        }
        return result;
    }
}
