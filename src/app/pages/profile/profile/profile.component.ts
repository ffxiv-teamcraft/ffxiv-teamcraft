import {Component, TemplateRef} from '@angular/core';
import {UserService} from '../../../core/database/user.service';
import {MatDialog} from '@angular/material';
import {MasterbooksPopupComponent} from '../masterbooks-popup/masterbooks-popup.component';
import {AppUser} from '../../../model/list/app-user';
import {CharacterAddPopupComponent} from '../../../modules/common-components/character-add-popup/character-add-popup.component';
import {PageComponent} from '../../../core/component/page-component';
import {ComponentType} from '@angular/cdk/portal';
import {HelpService} from '../../../core/component/help.service';
import {ProfileHelpComponent} from '../profile-help/profile-help.component';
import {ChangeEmailPopupComponent} from '../change-email-popup/change-email-popup.component';
import {ObservableMedia} from '@angular/flex-layout';
import {PatreonLinkPopupComponent} from '../patreon-link-popup/patreon-link-popup.component';
import {NicknamePopupComponent} from '../nickname-popup/nickname-popup.component';
import {GearSet} from '../../simulator/model/gear-set';
import {DataService} from '../../../core/api/data.service';
import {catchError, filter, map, mergeMap} from 'rxjs/operators';
import {StatsEditPopupComponent} from '../stats-edit-popup/stats-edit-popup.component';
import {ConfirmationPopupComponent} from '../../../modules/common-components/confirmation-popup/confirmation-popup.component';
import {combineLatest, of} from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends PageComponent {

    private craftingJobs: any[] = [
        {abbr: 'CRP', name: 'carpenter'},
        {abbr: 'BSM', name: 'blacksmith'},
        {abbr: 'ARM', name: 'armorer'},
        {abbr: 'GSM', name: 'goldsmith'},
        {abbr: 'LTW', name: 'leatherworker'},
        {abbr: 'WVR', name: 'weaver'},
        {abbr: 'ALC', name: 'alchemist'},
        {abbr: 'CUL', name: 'culinarian'},
        {abbr: 'MIN', name: 'miner'},
        {abbr: 'BTN', name: 'botanist'},
        {abbr: 'FSH', name: 'fisher'}
    ];

    public character: any;

    public user: AppUser;

    public jobs: GearSet[] = [];

    public contacts: any[] = [];

    constructor(private userService: UserService, protected dialog: MatDialog, private help: HelpService, protected media: ObservableMedia,
                private dataService: DataService) {
        super(dialog, help, media);
        this.subscriptions.push(userService.getCharacter().subscribe(character => {
            this.character = character;
        }));
        this.subscriptions.push(userService.getUserData().subscribe(user => this.user = user));
        this.subscriptions.push(this.userService.getUserData()
            .pipe(
                mergeMap(user => this.dataService.getGearsets(user.lodestoneId, false)
                    .pipe(
                        map(gearsets => {
                            return gearsets.map(set => {
                                const customSet = user.gearSets.find(s => s.jobId === set.jobId);
                                if (customSet !== undefined) {
                                    return customSet;
                                }
                                return set;
                            });
                        }),
                        map(sets => sets.map(set => {
                                const job = this.craftingJobs[set.jobId - 8];
                                if (job !== undefined) {
                                    set.abbr = job.abbr;
                                    set.name = job.name;
                                    return set;
                                }
                            }).filter(row => row !== null)
                        )
                    )
                )
            ).subscribe(jobs => this.jobs = jobs));
        this.subscriptions.push(
            userService.getUserData()
                .pipe(
                    mergeMap(user => {
                        return combineLatest(
                            user.contacts.map(contactId => {
                                return this.userService.getCharacter(contactId)
                                    .pipe(
                                        map(details => {
                                            details.$key = contactId;
                                            return details;
                                        }),
                                        catchError(() => {
                                            return of(null);
                                        })
                                    );
                            })
                        ).pipe(map(res => res.filter(row => row !== null)));
                    })
                ).subscribe(res => this.contacts = res));
    }

    public openNicknamePopup(): void {
        this.dialog.open(NicknamePopupComponent, {data: {user: this.user}});
    }

    public openMasterbooksPopup(jobAbbr: string): void {
        this.dialog.open(MasterbooksPopupComponent, {data: {jobAbbr: jobAbbr, user: this.user}});
    }

    public openStatsPopup(set: GearSet): void {
        this.dialog.open(StatsEditPopupComponent, {data: {set: set, jobs: this.craftingJobs.slice(0, 8)}});
    }

    changeCharacter(): void {
        this.dialog.open(CharacterAddPopupComponent);
    }

    changeEmail(): void {
        this.dialog.open(ChangeEmailPopupComponent);
    }

    openPatreonLinkPopup(): void {
        this.dialog.open(PatreonLinkPopupComponent, {data: this.user});
    }

    addContact(contactId: string): void {
        if (contactId !== undefined && contactId.length > 0 || contactId.indexOf(' ') > -1) {
            this.user.contacts = this.user.contacts.filter(contact => contact !== contactId);
            this.user.contacts.push(contactId);
            this.userService.set(this.user.$key, this.user);
        }
    }

    removeContact(contactId: string): void {
        this.dialog.open(ConfirmationPopupComponent)
            .afterClosed()
            .pipe(filter(res => res))
            .subscribe(() => {
                this.user.contacts = this.user.contacts.filter(contact => contact !== contactId);
                this.userService.set(this.user.$key, this.user);
            });
    }

    getHelpDialog(): ComponentType<any> | TemplateRef<any> {
        return ProfileHelpComponent;
    }
}
