import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/index';
import {Commission} from '../../../model/commission/commission';
import {CommissionStatus} from '../../../model/commission/commission-status';
import {mergeMap} from 'rxjs/operators';
import {UserService} from '../../../core/database/user.service';
import {CommissionService} from '../../../core/database/commission/commission.service';

@Component({
  selector: 'app-server-history',
  templateUrl: './server-history.component.html',
  styleUrls: ['./server-history.component.scss']
})
export class ServerHistoryComponent {

public commissions$: Observable<Commission[]>;

    constructor(private commissionService: CommissionService, private userService: UserService) {
        this.commissions$ = this.userService.getCharacter()
            .pipe(
                mergeMap(character => {
                    return this.commissionService.getAll(character.server, ref =>
                        ref.where('status', '==', CommissionStatus.DONE)
                           .orderBy('createdAt', 'desc')
                           .limit(50)
                    )
                })
        );
    }

    trackByCommissionFn(index: number, commission: Commission): string {
        return commission.$key;
    }
}
