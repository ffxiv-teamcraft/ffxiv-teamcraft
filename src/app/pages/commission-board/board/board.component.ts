import {Component} from '@angular/core';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {Commission} from '../../../model/commission/commission';
import {Observable} from 'rxjs/index';
import {UserService} from '../../../core/database/user.service';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent {

    public commissions$: Observable<Commission[]>;

    constructor(private commissionService: CommissionService, private userService: UserService) {
        // TODO uncomment for server-locked requests
        // this.commissions$ = this.userService.getCharacter()
        //     .pipe(
        //         mergeMap(character => {
        //             return this.commissionService.getAll(character.server);
        //         })
        //     );

        this.commissions$ = this.commissionService.getAll('Test');
    }

}
