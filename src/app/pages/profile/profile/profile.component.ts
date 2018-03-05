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

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent extends PageComponent {

    static craftingJobs = [
        {abbr: 'ALC', name: 'alchemist'},
        {abbr: 'ARM', name: 'armorer'},
        {abbr: 'BSM', name: 'blacksmith'},
        {abbr: 'CRP', name: 'carpenter'},
        {abbr: 'CUL', name: 'culinarian'},
        {abbr: 'GSM', name: 'goldsmith'},
        {abbr: 'LTW', name: 'leatherworker'},
        {abbr: 'WVR', name: 'weaver'},
        {abbr: 'BTN', name: 'botanist'},
        {abbr: 'MIN', name: 'miner'},
        {abbr: 'FSH', name: 'fisher'}];

    public character: any;

    public user: AppUser;


    constructor(userService: UserService, protected dialog: MatDialog, private help: HelpService, protected media: ObservableMedia) {
        super(dialog, help, media);
        this.subscriptions.push(userService.getCharacter().subscribe(character => {
            this.character = character;
        }));
        this.subscriptions.push(userService.getUserData().subscribe(user => this.user = user));
    }

    public getJobs(): any[] {
        return Object.keys(this.character.classjobs)
            .map(key => this.character.classjobs[key])
            .filter(job => {
                return ProfileComponent.craftingJobs.filter(j => j.name === job.name.toLowerCase()).length > 0;
            }).map(job => {
                job.abbr = ProfileComponent.craftingJobs.find(j => j.name === job.name.toLowerCase()).abbr;
                return job;
            })
    }

    public openMasterbooksPopup(jobAbbr: string): void {
        this.dialog.open(MasterbooksPopupComponent, {data: {jobAbbr: jobAbbr, user: this.user}});
    }

    changeCharacter(): void {
        this.dialog.open(CharacterAddPopupComponent);
    }

    changeEmail(): void {
        this.dialog.open(ChangeEmailPopupComponent);
    }

    getClassesCols(): number {
        if (this.media.isActive('xs') || this.media.isActive('sm')) {
            return 3;
        }
        if (this.media.isActive('md')) {
            return 4;
        }
        return 8;
    }

    getHelpDialog(): ComponentType<any> | TemplateRef<any> {
        return ProfileHelpComponent;
    }
}
