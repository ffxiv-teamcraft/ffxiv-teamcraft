import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  public permission: 'default' | NotificationPermission = 'default';

  isSupported(): boolean {
    return 'Notification' in window;
  }

  requestPermission(): void {
    if (this.isSupported()) {
      Notification.requestPermission().then(res => {
        this.permission = res;
      });
    }
  }

  create(title: string, options: NotificationOptions): void {
    if (this.isSupported()) {
      new Notification(title, options);
    }
  }

}
