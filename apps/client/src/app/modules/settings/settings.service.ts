import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Theme } from './theme';
import { IpcService } from '../../core/electron/ipc.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public themeChange$ = new Subject<{ previous: Theme, next: Theme }>();
  public settingsChange$ = new Subject<void>();
  private cache: { [id: string]: string };

  constructor(private ipc: IpcService) {
    this.cache = JSON.parse(localStorage.getItem('settings')) || {};
    this.ipc.on('update-settings', (e, settings) => {
      this.cache = settings;
      localStorage.setItem('settings', JSON.stringify(this.cache));
    });
  }

  public get availableLocales(): string[] {
    return ['en', 'de', 'fr', 'ja', 'pt', 'br', 'es', 'ko', 'zh', 'ru'];
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

  public get dbCommentsPosition(): string {
    return this.getSetting('default-db-comments-position', 'TOP');
  }

  public set dbCommentsPosition(position: string) {
    this.setSetting('default-db-comments-position', position);
  }

  public get defaultPermissionLevel(): number {
    return +this.getSetting('default-permission-level', '20');
  }

  public set defaultPermissionLevel(level: number) {
    this.setSetting('default-permission-level', level.toString());
  }

  public get startingPlace(): number {
    return +this.getSetting('startingPlace', '12');
  }

  public set startingPlace(startingPlace: number) {
    this.setSetting('startingPlace', startingPlace.toString());
  }

  public get freeAetheryte(): number {
    return +this.getSetting('freeAetheryte', '-1');
  }

  public set freeAetheryte(freeAetheryte: number) {
    this.setSetting('freeAetheryte', (freeAetheryte || 0).toString());
  }

  public get favoriteAetherytes(): number[] {
    return JSON.parse(this.getSetting('favoriteAetherytes', '[]'));
  }

  public set favoriteAetherytes(favoriteAetherytes: number[]) {
    this.setSetting('favoriteAetherytes', JSON.stringify(favoriteAetherytes));
  }

  public get compactSidebar(): boolean {
    return this.getSetting('compact-sidebar', 'false') === 'true';
  }

  public set compactSidebar(compact: boolean) {
    this.setSetting('compact-sidebar', compact.toString());
  }

  public get sidebarState(): {[index:string]:boolean} {
    return JSON.parse(this.getSetting('sidebar-state', JSON.stringify({
      general: true,
      sharing: true,
      gathering: true,
      helpers: false,
      other: false
    })));
  }

  public set sidebarState(state: {[index:string]:boolean}) {
    this.setSetting('sidebar-state', JSON.stringify(state));
  }

  public get autoMarkAsCompleted(): boolean {
    return this.getSetting('auto-mark-as-completed', 'false') === 'true';
  }

  public set autoMarkAsCompleted(markAsCompleted: boolean) {
    this.setSetting('auto-mark-as-completed', markAsCompleted.toString());
  }

  public get clickthroughOverlay(): boolean {
    return this.getSetting('clickthrough', 'false') === 'true';
  }

  public set clickthroughOverlay(clickthrough: boolean) {
    this.setSetting('clickthrough', clickthrough.toString());
  }

  public get alwaysHQLeves(): boolean {
    return this.getSetting('always-hq-leves', 'false') === 'true';
  }

  public set alwaysHQLeves(alwaysHqLeves: boolean) {
    this.setSetting('always-hq-leves', alwaysHqLeves.toString());
  }

  public get compactAlarms(): boolean {
    return this.getSetting('compact-alarms', 'false') === 'true';
  }

  public set compactAlarms(compact: boolean) {
    this.setSetting('compact-alarms', compact.toString());
  }

  public get performanceMode(): boolean {
    return this.getSetting('lists:perf-mode', 'false') === 'true';
  }

  public set performanceMode(enabled: boolean) {
    this.setSetting('lists:perf-mode', enabled.toString());
  }

  public get hideLargeListMessage(): boolean {
    return this.getSetting('lists:hide-large-list-message', 'false') === 'true';
  }

  public set hideLargeListMessage(hidden: boolean) {
    this.setSetting('lists:hide-large-list-message', hidden.toString());
  }

  public get disableSearchHistory(): boolean {
    return this.getSetting('disable-search-history', 'false') === 'true';
  }

  public set disableSearchHistory(disabled: boolean) {
    this.setSetting('disable-search-history', disabled.toString());
  }

  public get disableSearchDebounce(): boolean {
    return this.getSetting('disable-search-debounce', 'false') === 'true';
  }

  public set disableSearchDebounce(disabled: boolean) {
    this.setSetting('disable-search-debounce', disabled.toString());
  }

  public get expectToSellEverything(): boolean {
    return this.getSetting('pricing:expect-sell-all', 'false') === 'true';
  }

  public set expectToSellEverything(sellEverything: boolean) {
    this.setSetting('pricing:expect-sell-all', sellEverything.toString());
  }

  public get theme(): Theme {
    const themeName = this.getSetting('theme', 'DEFAULT');
    if (themeName === 'CUSTOM') {
      return this.customTheme;
    }
    return Theme.byName(themeName);
  }

  public set theme(theme: Theme) {
    this.themeChange$.next({ previous: this.theme, next: theme || this.customTheme });
    this.setSetting('theme', theme ? theme.name : 'CUSTOM');
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
    return +this.getSetting('alarm:volume', '0.5');
  }

  public set alarmVolume(volume: number) {
    this.setSetting('alarm:volume', volume.toString());
  }

  public get autofillCompletionSound(): string {
    return this.getSetting('autofill:completion:sound', 'Full_Party');
  }

  public set autofillCompletionSound(sound: string) {
    this.setSetting('autofill:completion:sound', sound);
  }

  public get autofillCompletionVolume(): number {
    return +this.getSetting('autofill:completion:volume', '0.5');
  }

  public set autofillCompletionVolume(volume: number) {
    this.setSetting('autofill:completion:volume', volume.toString());
  }

  public get alarmsMuted(): boolean {
    return this.getSetting('alarms:muted', 'false') === 'true';
  }

  public set alarmsMuted(muted: boolean) {
    this.setSetting('alarms:muted', muted.toString());
  }

  public get noPanelBorders(): boolean {
    return this.getSetting('noPanelBorders', 'false') === 'true';
  }

  public set noPanelBorders(borders: boolean) {
    this.setSetting('noPanelBorders', borders.toString());
  }

  public get itemTagsEnabled(): boolean {
    return this.getSetting('itemTagsEnabled', 'false') === 'true';
  }

  public set itemTagsEnabled(tagsEnabled: boolean) {
    this.setSetting('itemTagsEnabled', tagsEnabled.toString());
  }

  public get showAllAlarms(): boolean {
    return this.getSetting('showAllAlarms', 'false') === 'true';
  }

  public set showAllAlarms(showAllAlarms: boolean) {
    this.setSetting('showAllAlarms', showAllAlarms.toString());
  }

  public get displayRemaining(): boolean {
    return this.getSetting('displayRemaining', 'false') === 'true';
  }

  public set displayRemaining(displayRemaining: boolean) {
    this.setSetting('displayRemaining', displayRemaining.toString());
  }

  public get disableCrossWorld(): boolean {
    return this.getSetting('disableCrossWorld', 'false') === 'true';
  }

  public set disableCrossWorld(disableCrossWorld: boolean) {
    this.setSetting('disableCrossWorld', disableCrossWorld.toString());
  }

  public get showCopyOnOwnList(): boolean {
    return this.getSetting('showCopyOnOwnList', 'false') === 'true';
  }

  public set showCopyOnOwnList(tagsEnabled: boolean) {
    this.setSetting('showCopyOnOwnList', tagsEnabled.toString());
  }

  public get hideMachinaBanner(): boolean {
    return this.getSetting('machina:hide-banner', 'false') === 'true';
  }

  public set hideMachinaBanner(hide: boolean) {
    this.setSetting('machina:hide-banner', hide.toString());
  }

  public get enableAutofillByDefault(): boolean {
    return this.getSetting('autofill:enable-by-default', 'false') === 'true';
  }

  public set enableAutofillByDefault(enable: boolean) {
    this.setSetting('autofill:enable-by-default', enable.toString());
  }

  public get enableAutofillNotificationByDefault(): boolean {
    return this.getSetting('autofill:enable-notification-by-default', 'false') === 'true';
  }

  public set enableAutofillNotificationByDefault(enable: boolean) {
    this.setSetting('autofill:enable-notification-by-default', enable.toString());
  }

  public get enableAutofillHQFilter(): boolean {
    return this.getSetting('autofill:enable-hq-filter', 'false') === 'true';
  }

  public set enableAutofillHQFilter(enabled: boolean) {
    this.setSetting('autofill:enable-hq-filter', enabled.toString());
  }

  public get enableUniversalisSourcing(): boolean {
    return this.getSetting('universalis:enable-sourcing', 'false') === 'true';
  }

  public set enableUniversalisSourcing(enabled: boolean) {
    this.setSetting('universalis:enable-sourcing', enabled.toString());
  }

  public get customTheme(): Theme {
    return {
      ...Theme.DEFAULT,
      ...JSON.parse(this.getSetting('customTheme', '{"name": "CUSTOM"}'))
    };
  }

  public set customTheme(theme: Theme) {
    this.themeChange$.next({ previous: this.customTheme, next: theme });
    this.setSetting('customTheme', JSON.stringify(theme));
  }

  public get hideLargeLeves(): boolean {
    return this.getSetting('hideLargeLeves', 'false') === 'true';
  }

  public set hideLargeLeves(hideLargeLeves: boolean) {
    this.setSetting('hideLargeLeves', hideLargeLeves.toString());
  }

  public get macroExtraWait(): number {
    return Math.max(0, Math.floor(+this.getSetting('macroExtraWait', '0')));
  }

  public set macroExtraWait(extraWait: number) {
    this.setSetting('macroExtraWait', extraWait.toString());
  }

  public get macroEchoSeNumber(): number {
    return Math.min(16, Math.max(1, Math.floor(+this.getSetting('macroEchoSeNumber', '0'))));
  }

  public set macroEchoSeNumber(echoSeNumber: number) {
    this.setSetting('macroEchoSeNumber', echoSeNumber.toString());
  }

  public get macroEcho(): boolean {
    return this.getSetting('macroEcho', 'true') === 'true';
  }

  public set macroEcho(echo: boolean) {
    this.setSetting('macroEcho', echo.toString());
  }

  public get macroFixedEcho(): boolean {
    return this.getSetting('macroFixedEcho', 'false') === 'true';
  }

  public set macroFixedEcho(fixedEcho: boolean) {
    this.setSetting('macroFixedEcho', fixedEcho.toString());
  }

  public get macroLock(): boolean {
    return this.getSetting('macroLock', 'false') === 'true';
  }

  public set macroLock(lock: boolean) {
    this.setSetting('macroLock', lock.toString());
  }

  public get macroConsumables(): boolean {
    return this.getSetting('macroConsumables', 'true') === 'true';
  }

  public set macroConsumables(addConsumables: boolean) {
    this.setSetting('macroConsumables', addConsumables.toString());
  }

  public get macroBreakBeforeByregot(): boolean {
    return this.getSetting('macroBreakBeforeByregot', 'false') === 'true';
  }

  public set macroBreakBeforeByregot(breakBeforeByregot: boolean) {
    this.setSetting('macroBreakBeforeByregot', breakBeforeByregot.toString());
  }

  private getSetting(name: string, defaultValue: string): string {
    return this.cache[name] || defaultValue;
  }

  private setSetting(name: string, value: string): void {
    this.cache[name] = value;
    localStorage.setItem('settings', JSON.stringify(this.cache));
    this.ipc.send('apply-settings', { ...this.cache });
    this.settingsChange$.next();
  }

}
