import { Component } from '@angular/core';
import { SettingsService } from '../../../modules/settings/settings.service';
import { PlatformService } from '../../../core/tools/platform.service';
import { SoundNotificationType } from '../../../core/sound-notification/sound-notification-type';
import { SoundNotificationService } from '../../../core/sound-notification/sound-notification.service';

@Component({
  selector: 'app-alarms-options-popup',
  templateUrl: './alarms-options-popup.component.html',
  styleUrls: ['./alarms-options-popup.component.less']
})
export class AlarmsOptionsPopupComponent {

  public sounds = ['Wondrous_tales', 'LB_charged', 'Notification'];

  enableCustomSound = false;

  public alarmSettings = this.settings.getNotificationSettings(SoundNotificationType.ALARM);

  constructor(public settings: SettingsService, public platform: PlatformService,
              private soundNotificationService: SoundNotificationService) {
    this.enableCustomSound = this.alarmSettings.sound.indexOf(':') > -1;
  }

  public previewSound(): void {
    this.soundNotificationService.play(SoundNotificationType.ALARM);
  }

  public setVolume(volume: number): void {
    this.alarmSettings.volume = volume;
    this.settings.setNotificationSettings(SoundNotificationType.ALARM, this.alarmSettings);
    this.previewSound();
  }

  public setSound(sound: string): void {
    if (['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.mp4', '.wma', '.aac'].some(ext => sound.endsWith(ext))) {
      this.alarmSettings.sound = sound;
      this.settings.setNotificationSettings(SoundNotificationType.ALARM, this.alarmSettings);
      this.previewSound();
    }
  }

  public setHoursBefore(hours: number): void {
    this.settings.alarmHoursBefore = hours;
  }

}
