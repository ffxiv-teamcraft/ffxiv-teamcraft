import {Component} from '@angular/core';
import {SettingsService} from '../../settings/settings.service';

@Component({
    selector: 'app-timer-options-popup',
    templateUrl: './timer-options-popup.component.html',
    styleUrls: ['./timer-options-popup.component.scss']
})
export class TimerOptionsPopupComponent {

    public sounds = ['Wondrous_tales', 'LB_charged', 'Notification'];

    constructor(private settings: SettingsService) {
    }

    public previewSound(): void {
        const audio = new Audio(`/assets/audio/${this.settings.alarmSound}.mp3`);
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
