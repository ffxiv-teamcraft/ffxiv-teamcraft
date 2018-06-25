import {Component, Inject} from '@angular/core';
import {List} from '../../../model/list/list';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Router} from '@angular/router';
import {Commission} from '../../../model/commission/commission';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {UserService} from '../../../core/database/user.service';
import {first, map, mergeMap} from 'rxjs/operators';

@Component({
    selector: 'app-commission-creation-popup',
    templateUrl: './commission-creation-popup.component.html',
    styleUrls: ['./commission-creation-popup.component.scss']
})
export class CommissionCreationPopupComponent {

    public price = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public list: List, private router: Router, private commissionService: CommissionService,
                private ref: MatDialogRef<CommissionCreationPopupComponent>, private userService: UserService) {
    }

    public createCommission(): void {
        this.userService.getCharacter()
            .pipe(
                first(),
                mergeMap(character => {
                    const commission = new Commission(character.userId, this.list, character.server);
                    commission.price = this.price;
                    return this.commissionService.add(commission)
                        .pipe(
                            map(res => {
                                return {
                                    uid: res,
                                    server: character.server
                                }
                            })
                        );
                })
            )
            .subscribe(res => {
                this.router.navigate(['commission', res.server, res.uid]);
                this.ref.close()
            });
    }

}
