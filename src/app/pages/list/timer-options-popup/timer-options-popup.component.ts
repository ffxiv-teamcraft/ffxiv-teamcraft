import {Component} from '@angular/core';
import {SettingsService} from '../../settings/settings.service';
import {PlatformService} from '../../../core/tools/platform.service';

@Component({
    selector: 'app-timer-options-popup',
    templateUrl: './timer-options-popup.component.html',
    styleUrls: ['./timer-options-popup.component.scss']
})
export class TimerOptionsPopupComponent {

    public sounds = ['Wondrous_tales', 'LB_charged', 'Notification'];

    enableCustomSound = false;

    constructor(public settings: SettingsService, public platform: PlatformService) {
        this.enableCustomSound = this.settings.alarmSound.indexOf(':') > -1;
    }

    public previewSound(): void {
        let audio: HTMLAudioElement;
        if (this.settings.alarmSound.indexOf(':') === -1) {
            // If this is not a custom alarm sound, create the audio element from assets
            audio = new Audio(`./assets/audio/${this.settings.alarmSound}.mp3`);
        } else {
            // Else, create it from the custom file path
            audio = new Audio(this.settings.alarmSound);
        }
        audio.loop = false;
        audio.volume = this.settings.alarmVolume;
        audio.play();
    }

    public setVolume(volume: number): void {
        this.settings.alarmVolume = volume;
        this.previewSound();
    }

    public setSound(sound: string): void {
        this.settings.alarmSound = sound;
        this.previewSound();
    }

    public setHoursBefore(hours: number): void {
        this.settings.alarmHoursBefore = hours;
    }

}
