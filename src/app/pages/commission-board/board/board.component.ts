import {Component} from '@angular/core';
import {CommissionService} from '../../../core/database/commission/commission.service';
import {Commission} from '../../../model/commission/commission';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs/index';
import {UserService} from '../../../core/database/user.service';
import {map, mergeMap} from 'rxjs/operators';
import {CommissionStatus} from '../../../model/commission/commission-status';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent {

    public commissions$: Observable<Commission[]>;

    public filters: any = {
        minPrice: 0,
        maxPrice: Number.POSITIVE_INFINITY,
        onlyCraft: true,
        crafting: true,
        gathering: true,
        hunting: true,
    };

    public filters$: BehaviorSubject<any> = new BehaviorSubject<any>(this.filters);

    constructor(private commissionService: CommissionService, private userService: UserService) {
        this.commissions$ = combineLatest(this.userService.getCharacter(), this.filters$)
            .pipe(
                mergeMap(([character, filters]) => {
                    return this.commissionService.getAll(character.server, ref => ref.where('status', '==', CommissionStatus.CREATED))
                        .pipe(
                            map(commissions => {
                                return commissions.filter(com => {
                                    let matches = com.price >= filters.minPrice
                                        && com.price <= filters.maxPrice;

                                    // We only exclude tags if they's unchecked
                                    if (!filters.onlyCraft) {
                                        matches = matches && !com.onlyNeedsCraft;
                                    }
                                    if (!filters.crafting) {
                                        matches = matches && !com.isCrafting();
                                    }
                                    if (!filters.gathering) {
                                        matches = matches && !com.isGathering();
                                    }
                                    if (!filters.hunting) {
                                        matches = matches && !com.isHunting();
                                    }
                                    return matches
                                })
                            })
                        );
                })
            );
    }

    applyFilters(): void {
        this.filters$.next(this.filters);
    }

    trackByCommissionFn(index: number, commission: Commission): string {
        return commission.$key;
    }

}
