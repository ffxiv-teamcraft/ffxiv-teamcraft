import {Component} from '@angular/core';

@Component({
    selector: 'app-timer-options-popup',
    templateUrl: './timer-options-popup.component.html',
    styleUrls: ['./timer-options-popup.component.scss']
})
export class TimerOptionsPopupComponent {

    private options: any = {
        sound: 'Wondrous_tales',
        hoursBefore: 0
    };

    public sounds = ['Wondrous_tales', 'LB_charged', 'Notification'];

    constructor() {
        const stored = localStorage.getItem('timer:options');
        if (stored !== null) {
            this.options = JSON.parse(stored);
        }
        this.persist();
    }

    public persist(): void {
        localStorage.setItem('timer:options', JSON.stringify(this.options));
    }

    public previewSound(): void {
        const audio = new Audio(`/assets/audio/${this.options.sound}.mp3`);
        audio.loop = false;
        audio.play();
    }

}
