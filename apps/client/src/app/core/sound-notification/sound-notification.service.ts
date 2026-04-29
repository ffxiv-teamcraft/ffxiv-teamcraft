import { Injectable, inject } from '@angular/core';
import { SettingsService } from '../../modules/settings/settings.service';
import { SoundNotificationType } from './sound-notification-type';

@Injectable({
  providedIn: 'root'
})
export class SoundNotificationService {
  private settings = inject(SettingsService);


  public play(type: SoundNotificationType): void {
    const notificationSettings = this.settings.getNotificationSettings(type);
    // Let's ring the alarm !
    let audio: HTMLAudioElement;
    // If this isn't a file path (desktop app), then take it inside the assets folder.
    if (!notificationSettings.sound.includes(':')) {
      audio = new Audio(`./assets/audio/${notificationSettings.sound}.mp3`);
    } else {
      audio = new Audio(notificationSettings.sound);
    }
    audio.loop = false;
    audio.volume = notificationSettings.volume;
    audio.crossOrigin = 'anonymous';
    audio.play()
      .then()
      .catch((err) => {
        console.error('Failed to play Audio');
        console.error(err);
      });
  }
}
