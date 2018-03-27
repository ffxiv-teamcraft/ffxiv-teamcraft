import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class SettingsService {

    private cache: { [id: string]: string };

    public themeChange$ = new Subject<{ previous: string, next: string }>();

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

    public get compactSidebar(): boolean {
        return this.getSetting('compact-sidebar', 'false') === 'true';
    }

    public set compactSidebar(compact: boolean) {
        this.setSetting('compact-sidebar', compact.toString());
    }

    public get compactAlarms(): boolean {
        return this.getSetting('compact-alarms', 'false') === 'true';
    }

    public set compactAlarms(compact: boolean) {
        this.setSetting('compact-alarms', compact.toString());
    }

    public get theme(): string {
        return this.getSetting('theme', 'dark-orange');
    }

    public set theme(theme: string) {
        this.themeChange$.next({previous: this.theme, next: theme});
        this.setSetting('theme', theme);
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

    public get alarmsMuted(): boolean {
        return this.getSetting('alarms:muted', 'false') === 'true';
    }

    public set alarmsMuted(compact: boolean) {
        this.setSetting('alarms:muted', compact.toString());
    }

    public get ffxivcraftingDisplay(): boolean {
        return this.getSetting('ffxivcrafting-display', 'false') === 'true';
    }

    public set ffxivcraftingDisplay(display: boolean) {
        this.setSetting('ffxivcrafting-display', display.toString())
    }

    private getSetting(name: string, defaultValue: string): string {
        return this.cache[name] || defaultValue;
    }

    private setSetting(name: string, value: string): void {
        this.cache[name] = value;
        localStorage.setItem('settings', JSON.stringify(this.cache));
    }

}
