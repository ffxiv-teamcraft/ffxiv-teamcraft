import {Component} from '@angular/core';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {UserService} from '../../../core/database/user.service';
import {map, mergeMap} from 'rxjs/operators';
import {of} from 'rxjs';
import {CommissionStatus} from '../../../model/commission/commission-status';

@Component({
    selector: 'app-commission-board',
    templateUrl: './commission-board.component.html',
    styleUrls: ['./commission-board.component.scss']
})
export class CommissionBoardComponent {

    navLinks = [
        {
            path: 'board',
            label: 'COMMISSION_BOARD.Board',
            hasNewThings: of(false)
        },
        {
            path: 'my-requests',
            label: 'COMMISSION_BOARD.My_requests',
            hasNewThings: this.userService.getCharacter()
                .pipe(
                    mergeMap(character => {
                        return this.commissionService.getAll(character.server, ref => ref.where('authorId', '==', character.userId))
                            .pipe(
                                map(commissions => {
                                    return commissions.reduce((hasNewThings, commission) => {
                                        return hasNewThings || commission.hasNewThing(character.userId);
                                    }, false);
                                })
                            );
                    }),
                )
        },
        {
            path: 'my-crafts',
            label: 'COMMISSION_BOARD.My_crafts',
            hasNewThings: this.userService.getCharacter()
                .pipe(
                    mergeMap(character => {
                        return this.commissionService.getAll(character.server, ref => ref.where('crafterId', '==', character.userId))
                            .pipe(
                                map(commissions => {
                                    return commissions.reduce((hasNewThings, commission) => {
                                        return hasNewThings ||
                                            (commission.hasNewThing(character.userId) && commission.status !== CommissionStatus.DONE);
                                    }, false);
                                })
                            );
                    }),
                )
        },
        {
            path: 'history',
            label: 'COMMISSION_BOARD.History',
            hasNewThings: this.userService.getCharacter()
                .pipe(
                    mergeMap(character => {
                        return this.commissionService.getAll(character.server, ref => ref.where('status', '==', 2))
                            .pipe(
                                map(commissions => {
                                    return commissions.reduce((hasNewThings, commission) => {
                                        return hasNewThings || commission.hasNewThing(character.userId);
                                    }, false);
                                })
                            );
                    }),
                )
        },
    ];

    constructor(private userService: UserService, private commissionService: CommissionService) {
    }
}
