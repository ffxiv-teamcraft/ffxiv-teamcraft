import {Component, Inject} from '@angular/core';
import {List} from '../../../model/list/list';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Router} from '@angular/router';
import {Commission} from '../../../model/commission/commission';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {UserService} from '../../../core/database/user.service';
import {first, map, mergeMap, tap} from 'rxjs/operators';
import {ListService} from '../../../core/database/list.service';
import {PermissionsRegistry} from '../../../core/database/permissions/permissions-registry';

@Component({
    selector: 'app-commission-creation-popup',
    templateUrl: './commission-creation-popup.component.html',
    styleUrls: ['./commission-creation-popup.component.scss']
})
export class CommissionCreationPopupComponent {

    public price = 0;

    constructor(@Inject(MAT_DIALOG_DATA) public list: List, private router: Router, private commissionService: CommissionService,
                private ref: MatDialogRef<CommissionCreationPopupComponent>, private userService: UserService,
                private listService: ListService) {
    }

    public createCommission(): void {
        this.userService.getCharacter()
            .pipe(
                first(),
                mergeMap(character => {
                    const commission = new Commission(character.userId, this.list, character.server);
                    commission.price = this.price;
                    commission.onlyNeedsCraft = this.list.onlyNeedsCrafts();
                    return this.commissionService.add(commission)
                        .pipe(
                            map(res => {
                                return {
                                    uid: res,
                                    server: character.server
                                }
                            })
                        );
                }),
                mergeMap(() => {
                    // Delete list author id to detach it from the author, keeping it attached to the commission.
                    delete this.list.authorId;
                    this.list.permissionsRegistry = new PermissionsRegistry();
                    this.list.permissionsRegistry.everyone = {read: true, write: false, participate: false};
                    // Save the list
                    return this.listService.set(this.list.$key, this.list);
                })
            )
            .subscribe(() => {
                this.router.navigate(['commissions', 'my-requests']);
                this.ref.close()
            });
    }

}
