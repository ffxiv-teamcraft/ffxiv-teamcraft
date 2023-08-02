import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  public permission: 'default' | NotificationPermission = 'default';

  isSupported(): boolean {
    return true;
  }

  requestPermission(): void {
    Notification.requestPermission().then(res => {
      this.permission = res;
    });
  }

  create(title: string, options:NotificationOptions): void {
    new Notification(title, options);
  }

}
