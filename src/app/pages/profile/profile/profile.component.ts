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
import {first, map, mergeMap} from 'rxjs/operators';
import {StatsEditPopupComponent} from '../stats-edit-popup/stats-edit-popup.component';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends PageComponent {

    static craftingJobs = [
        {abbr: 'CRP', name: 'carpenter'},
        {abbr: 'BSM', name: 'blacksmith'},
        {abbr: 'ARM', name: 'armorer'},
        {abbr: 'LTW', name: 'leatherworker'},
        {abbr: 'WVR', name: 'weaver'},
        {abbr: 'GSM', name: 'goldsmith'},
        {abbr: 'ALC', name: 'alchemist'},
        {abbr: 'CUL', name: 'culinarian'},
        {abbr: 'MIN', name: 'miner'},
        {abbr: 'BTN', name: 'botanist'},
        {abbr: 'FSH', name: 'fisher'}];

    public character: any;

    public user: AppUser;

    public jobs: GearSet[] = [];


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
                        map(sets => sets.map(set => {
                            set.abbr = ProfileComponent.craftingJobs[set.jobId - 8].abbr;
                            set.name = ProfileComponent.craftingJobs[set.jobId - 8].name;
                            return set;
                        })),
                        map(gearsets => {
                            return gearsets.map(set => {
                                const customSet = user.gearSets.find(s => s.jobId === set.jobId);
                                if (customSet !== undefined) {
                                    return customSet;
                                }
                                return set;
                            });
                        })
                    )
                )
            ).subscribe(jobs => this.jobs = jobs));
    }

    public openNicknamePopup(): void {
        this.dialog.open(NicknamePopupComponent, {data: {user: this.user}});
    }

    public openMasterbooksPopup(jobAbbr: string): void {
        this.dialog.open(MasterbooksPopupComponent, {data: {jobAbbr: jobAbbr, user: this.user}});
    }

    public openStatsPopup(set: GearSet): void {
        this.dialog.open(StatsEditPopupComponent, {data: set});
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

    getHelpDialog(): ComponentType<any> | TemplateRef<any> {
        return ProfileHelpComponent;
    }
}
