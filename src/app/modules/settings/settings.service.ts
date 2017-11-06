import {Injectable} from '@angular/core';

@Injectable()
export class SettingsService {

    public get baseLink(): string {
        return localStorage.getItem('settings:base-link') || 'XIVDB';
    }

    public set baseLink(base: string) {
        localStorage.setItem('settings:base-link', base);
    }

    public get alarmHoursBefore(): number {
        return 0;
    }

    public get alarmSound(): string {
        return 'Notification';
    }

    public get alarmVolume(): number {
        return 1;
    }

}
