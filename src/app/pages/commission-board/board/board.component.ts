import {Component} from '@angular/core';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {Commission} from '../../../model/commission/commission';
import {Observable} from 'rxjs/index';
import {UserService} from '../../../core/database/user.service';
import {mergeMap} from 'rxjs/operators';
import {CommissionStatus} from '../../../model/commission/commission-status';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent {

    public commissions$: Observable<Commission[]>;

    constructor(private commissionService: CommissionService, private userService: UserService) {
        this.commissions$ = this.userService.getCharacter()
            .pipe(
                mergeMap(character => {
                    return this.commissionService.getAll(character.server, ref => ref.where('status', '==', CommissionStatus.CREATED));
                })
            );
    }

}
