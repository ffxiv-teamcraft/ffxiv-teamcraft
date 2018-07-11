import {Component} from '@angular/core';
import {TeamService} from '../../../core/database/team.service';
import {Team} from '../../../model/other/team';
import {combineLatest, Observable, of} from 'rxjs/index';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewTeamPopupComponent} from '../new-team-popup/new-team-popup.component';
import {filter, first, map, mergeMap, switchMap} from 'rxjs/operators';
import {UserService} from '../../../core/database/user.service';
import {TranslateService} from '@ngx-translate/core';
import {AppUser} from '../../../model/list/app-user';
import {UserSelectionPopupComponent} from '../../../modules/common-components/user-selection-popup/user-selection-popup.component';
import {faPatreon} from '@fortawesome/fontawesome-free-brands';
import fontawesome from '@fortawesome/fontawesome';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';

@Component({
    selector: 'app-team',
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.scss']
})
export class TeamComponent {

    public teams$: Observable<Team[]>;

    public teamMembersObservables: { [index: string]: Observable<any[]> } = {};

    public user$: Observable<AppUser>;

    constructor(private teamService: TeamService, private dialog: MatDialog, private userService: UserService,
                private snack: MatSnackBar, private translate: TranslateService) {
        this.teams$ = this.teamService.getUserTeams();
        this.user$ = this.userService.getUserData();

        fontawesome.library.add(faPatreon);
    }

    addUser(team: Team): void {
        this.dialog.open(UserSelectionPopupComponent).afterClosed()
            .pipe(
                filter(u => u !== ''),
                map(user => {
                    team.addMember(user.$key);
                    return team;
                }),
                mergeMap(updatedTeam => this.teamService.set(updatedTeam.$key, updatedTeam))
            )
            .subscribe(() => {
                // Clear team members cache
                delete this.teamMembersObservables[team.$key];
            });
    }

    removeUser(team: Team, user: AppUser): void {
        this.dialog.open(ConfirmationPopupComponent).afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => of(team)),
                map((t) => {
                    t.removeMember(user.$key);
                    return t;
                }),
                mergeMap(updatedTeam => this.teamService.set(updatedTeam.$key, updatedTeam))
            )
            .subscribe(() => {
                // Clear team members cache
                delete this.teamMembersObservables[team.$key];
            });
    }

    newTeam(): void {
        this.userService.getUserData()
            .pipe(
                first(),
                switchMap(user => {
                    return this.dialog.open(NewTeamPopupComponent)
                        .afterClosed()
                        .pipe(
                            filter(res => res !== undefined && res !== ''),
                            map(teamName => {
                                const team = new Team();
                                team.name = teamName;
                                team.leader = user.$key;
                                team.addMember(user.$key);
                                return team;
                            }),
                            mergeMap(team => this.teamService.add(team)),
                            map(() => this.snack.open(this.translate.instant('TEAMS.Team_created'), '',
                                {duration: 5000}))
                        )
                })
            ).subscribe();
    }

    deleteTeam(team: Team): void {
        this.dialog.open(ConfirmationPopupComponent).afterClosed()
            .pipe(
                filter(res => res),
                mergeMap(() => this.teamService.remove(team.$key))
            )
            .subscribe(() => {
                // Clear team members cache
                delete this.teamMembersObservables[team.$key];
            });
    }

    getTeamMembers(team: Team): Observable<any[]> {
        if (this.teamMembersObservables[team.$key] === undefined) {
            const members$ = Object.keys(team.members)
                .map(memberId => this.userService.getCharacter(memberId));
            this.teamMembersObservables[team.$key] = combineLatest(members$);
        }
        return this.teamMembersObservables[team.$key]
    }

    trackByTeamFn(index: number, team: Team): string {
        return team.$key;
    }

}
