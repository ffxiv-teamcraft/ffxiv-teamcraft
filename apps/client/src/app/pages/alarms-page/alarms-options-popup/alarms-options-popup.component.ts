import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { PlatformService } from '../../../core/tools/platform.service';

@Component({
  selector: 'app-alarms-options-popup',
  templateUrl: './alarms-options-popup.component.html',
  styleUrls: ['./alarms-options-popup.component.less']
})
export class AlarmsOptionsPopupComponent implements OnInit {


  public get settings(): SettingsService {
    return this._settings;
  }

  public sounds = ['Wondrous_tales', 'LB_charged', 'Notification'];

  enableCustomSound = false;

  constructor(private _settings: SettingsService, public platform: PlatformService) {
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


  ngOnInit() {
  }

}
