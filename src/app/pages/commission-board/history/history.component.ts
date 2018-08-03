import { Component, OnInit } from '@angular/core';
import {combineLatest, Observable} from 'rxjs/index';
import {Commission} from '../../../model/commission/commission';
import {CommissionStatus} from '../../../model/commission/commission-status';
import {map, mergeMap} from 'rxjs/operators';
import {UserService} from '../../../core/database/user.service';
import {CommissionService} from '../../../core/database/commission/commission.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {

    public commissions$: Observable<Commission[]>;

    constructor(private commissionService: CommissionService, private userService: UserService) {
        const myRequests$ = this.userService.getCharacter()
            .pipe(
                mergeMap(character => {
                    return this.commissionService.getAll(character.server, ref =>
                        ref.where('authorId', '==', character.userId)
                           .where('status', '==', CommissionStatus.DONE)
                    )
                })
            );
        const myCrafts$ = this.userService.getCharacter()
            .pipe(
                mergeMap(character => {
                    return this.commissionService.getAll(character.server, ref =>
                        ref.where('crafterId', '==', character.userId)
                           .where('status', '==', CommissionStatus.DONE)
                    )
                })
            );
        this.commissions$ = combineLatest(myRequests$, myCrafts$)
            .pipe(
                map(results => [...results[0], ...results[1]]),
                map(results => results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            )
    }

    trackByCommissionFn(index: number, commission: Commission): string {
        return commission.$key;
    }

}
