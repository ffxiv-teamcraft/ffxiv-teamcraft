import {Component} from '@angular/core';
import {Observable} from 'rxjs/index';
import {UserService} from '../../../core/database/user.service';
import {mergeMap} from 'rxjs/operators';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {Commission} from '../../../model/commission/commission';

@Component({
    selector: 'app-my-requests',
    templateUrl: './my-requests.component.html',
    styleUrls: ['./my-requests.component.scss']
})
export class MyRequestsComponent {

    public commissions$: Observable<Commission[]>;

    constructor(private commissionService: CommissionService, private userService: UserService) {
        this.commissions$ = this.userService.getCharacter()
            .pipe(
                mergeMap(character => {
                    return this.commissionService.getAll(character.server, ref => ref.where('authorId', '==', character.userId));
                })
            );
    }

    trackByCommissionFn(index: number, commission: Commission): string {
        return commission.$key;
    }

}
