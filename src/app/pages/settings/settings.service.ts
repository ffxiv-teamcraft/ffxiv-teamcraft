import {Injectable} from '@angular/core';

@Injectable()
export class SettingsService {

    private cache: { [id: string]: string };

    constructor() {
        this.cache = JSON.parse(localStorage.getItem('settings')) || {};
    }

    public get baseLink(): string {
        return this.getSetting('base-link', 'XIVDB');
    }

    public set baseLink(base: string) {
        this.setSetting('base-link', base);
    }

    public get compactLists(): boolean {
        return this.getSetting('compact-lists', 'false') === 'true';
    }

    public set compactLists(compact: boolean) {
        this.setSetting('compact-lists', compact.toString());
    }

    public get lightTheme(): boolean {
        return this.getSetting('light-theme', 'false') === 'true';
    }

    public set lightTheme(light: boolean) {
        this.setSetting('light-theme', light.toString());
    }

    public get alarmHoursBefore(): number {
        return +this.getSetting('alarm:hours-before', '0');
    }

    public set alarmHoursBefore(hours: number) {
        this.setSetting('alarm:hours-before', hours.toString());
    }

    public get alarmSound(): string {
        return this.getSetting('alarm:sound', 'Notification');
    }

    public set alarmSound(sound: string) {
        this.setSetting('alarm:sound', sound);
    }

    public get alarmVolume(): number {
        return +this.getSetting('alarm:volume', '1');
    }

    public set alarmVolume(volume: number) {
        this.setSetting('alarm:volume', volume.toString());
    }

    private getSetting(name: string, defaultValue: string): string {
        return this.cache[name] || defaultValue;
    }

    private setSetting(name: string, value: string): void {
        this.cache[name] = value;
        localStorage.setItem('settings', JSON.stringify(this.cache));
    }

}
