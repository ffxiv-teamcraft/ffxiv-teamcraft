import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Theme } from './theme';

@Injectable()
export class SettingsService {

  public themeChange$ = new Subject<{ previous: Theme, next: Theme }>();
  private readonly cache: { [id: string]: string };

  constructor() {
    this.cache = JSON.parse(localStorage.getItem('settings')) || {};
  }

  public get availableLocales(): string[] {
    return ['en', 'de', 'fr', 'ja', 'pt', 'br', 'es', 'ko', 'zh', 'ru'];
  }

  public get baseLink(): string {
    return this.getSetting('base-link', 'Garlandtools');
  }

  public set baseLink(base: string) {
    this.setSetting('base-link', base);
  }

  public get timeFormat(): '24H' | '12H' {
    return this.getSetting('time-format', '24H') as '24H' | '12H';
  }

  public set timeFormat(format: '24H' | '12H') {
    this.setSetting('time-format', format);
  }

  public get autoOpenInDesktop(): boolean {
    return this.getSetting('auto-open-in-desktop', 'true') === 'true';
  }

  public set autoOpenInDesktop(open: boolean) {
    this.setSetting('auto-open-in-desktop', open.toString());
  }


  public get preferredCopyType(): string {
    return this.getSetting('copy-type', 'classic');
  }

  public set preferredCopyType(copyType: string) {
    this.setSetting('copy-type', copyType);
  }

  public get defaultPermissionLevel(): number {
    return +this.getSetting('default-permission-level', '20');
  }

  public set defaultPermissionLevel(level: number) {
    this.setSetting('default-permission-level', level.toString());
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

  public get notificationsMuted(): boolean {
    return this.getSetting('notifications-muted', 'false') === 'true';
  }

  public set notificationsMuted(compact: boolean) {
    this.setSetting('notifications-muted', compact.toString());
  }

  public get expectToSellEverything(): boolean {
    return this.getSetting('pricing:expect-sell-all', 'false') === 'true';
  }

  public set expectToSellEverything(sellEverything: boolean) {
    this.setSetting('pricing:expect-sell-all', sellEverything.toString());
  }

  public get theme(): Theme {
    const themeName = this.getSetting('theme', 'DEFAULT');
    return Theme.byName(themeName);
  }

  public set theme(theme: Theme) {
    this.themeChange$.next({ previous: this.theme, next: theme });
    this.setSetting('theme', theme.name);
  }

  public get alarmHoursBefore(): number {
    return +this.getSetting('alarm:hours-before', '0');
  }

  public set alarmHoursBefore(hours: number) {
    this.setSetting('alarm:hours-before', hours.toString());
  }

  public get preferredStartingPoint(): number {
    // Default value is Rhalgr's reach, 2403
    return +this.getSetting('preferred-starting-point', '2403');
  }

  public set preferredStartingPoint(id: number) {
    this.setSetting('preferred-starting-point', id.toString());
  }

  public get alarmSound(): string {
    return this.getSetting('alarm:sound', 'Notification');
  }

  public set alarmSound(sound: string) {
    this.setSetting('alarm:sound', sound);
  }

  public get alarmVolume(): number {
    return +this.getSetting('alarm:volume', '0.5');
  }

  public set alarmVolume(volume: number) {
    this.setSetting('alarm:volume', volume.toString());
  }

  public get alarmsMuted(): boolean {
    return this.getSetting('alarms:muted', 'false') === 'true';
  }

  public set alarmsMuted(muted: boolean) {
    this.setSetting('alarms:muted', muted.toString());
  }

  public get ffxivcraftingDisplay(): boolean {
    return this.getSetting('ffxivcrafting-display', 'false') === 'true';
  }

  public set ffxivcraftingDisplay(display: boolean) {
    this.setSetting('ffxivcrafting-display', display.toString());
  }

  public get noPanelBorders(): boolean {
    return this.getSetting('noPanelBorders', 'false') === 'true';
  }

  public set noPanelBorders(borders: boolean) {
    this.setSetting('noPanelBorders', borders.toString());
  }

  private getSetting(name: string, defaultValue: string): string {
    return this.cache[name] || defaultValue;
  }

  private setSetting(name: string, value: string): void {
    this.cache[name] = value;
    localStorage.setItem('settings', JSON.stringify(this.cache));
  }

}
