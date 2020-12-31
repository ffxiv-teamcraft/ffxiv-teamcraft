import { Injectable, Optional } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Theme } from './theme';
import { IpcService } from '../../core/electron/ipc.service';
import { Region } from './region.enum';
import { map, startWith } from 'rxjs/operators';
import { CommissionTag } from '../commission-board/model/commission-tag';
import { Language } from '../../core/data/language';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public regionChange$ = new Subject<{ previous: Region, next: Region }>();
  public region$: Observable<Region>;
  public themeChange$ = new Subject<{ previous: Theme, next: Theme }>();
  public settingsChange$ = new Subject<string>();
  private cache: { [id: string]: string };

  constructor(@Optional() private ipc: IpcService) {
    this.cache = JSON.parse(localStorage.getItem('settings')) || {};
    if (this.ipc) {
      this.ipc.on('update-settings', (e, settings) => {
        this.cache = settings;
        localStorage.setItem('settings', JSON.stringify(this.cache));
      });
    }
    this.region$ = this.regionChange$.pipe(map(change => change.next), startWith(this.region));
  }

  public get availableLocales(): string[] {
    return ['en', 'de', 'fr', 'ja', 'pt', 'br', 'es', 'ko', 'zh', 'ru'];
  }

  public get availableRegions(): Region[] {
    return [Region.Global, Region.China, Region.Korea];
  }

  public get region(): Region {
    return this.getSetting('region', Region.Global) as Region;
  }

  public set region(region: Region) {
    this.regionChange$.next({ previous: this.region, next: region });
    this.setSetting('region', region);
  }

  public get hideRegionBanner(): boolean {
    return this.getSetting('region:hide-banner', 'false') === 'true';
  }

  public set hideRegionBanner(hide: boolean) {
    this.setSetting('region:hide-banner', hide.toString());
  }

  public get showOnlyCraftableInRecipeFinder(): boolean {
    return this.getSetting('recipe-finder:only-craftable', 'false') === 'true';
  }

  public set showOnlyCraftableInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:only-craftable', show.toString());
  }

  public get showOnlyNotCompletedInRecipeFinder(): boolean {
    return this.getSetting('recipe-finder:only-not-completed', 'false') === 'true';
  }

  public set showOnlyNotCompletedInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:only-not-completed', show.toString());
  }

  public get showOnlyCollectablesInRecipeFinder(): boolean {
    return this.getSetting('recipe-finder:only-collectables', 'false') === 'true';
  }

  public set showOnlyCollectablesInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:only-collectables', show.toString());
  }

  public get configurationPanelExpanded(): boolean {
    return this.getSetting('simulation:configuration:expanded', 'true') === 'true';
  }

  public set configurationPanelExpanded(expanded: boolean) {
    this.setSetting('simulation:configuration:expanded', expanded.toString());
  }

  public get searchLanguage(): Language {
    return this.getSetting('search:language', null) as Language;
  }

  public set searchLanguage(lang: Language) {
    this.setSetting('search:language', lang.toString());
  }

  public get detailedSimulatorActions(): boolean {
    return this.getSetting('simulation:actions:detailed', 'false') === 'true';
  }

  public set detailedSimulatorActions(detailed: boolean) {
    this.setSetting('simulation:actions:detailed', detailed.toString());
  }

  public get timeFormat(): '24H' | '12H' {
    return this.getSetting('time-format', '24H') as '24H' | '12H';
  }

  public set timeFormat(format: '24H' | '12H') {
    this.setSetting('time-format', format);
  }

  public get listScrollingMode(): 'default' | 'large' | 'never' {
    return this.getSetting('list-scrolling-mode', 'default') as 'default' | 'large' | 'never';
  }

  public set listScrollingMode(format: 'default' | 'large' | 'never') {
    this.setSetting('list-scrolling-mode', format);
  }

  public get autoOpenInDesktop(): boolean {
    return this.getSetting('auto-open-in-desktop', 'true') === 'true';
  }

  public set autoOpenInDesktop(open: boolean) {
    this.setSetting('auto-open-in-desktop', open.toString());
  }

  public get autoShowPatchNotes(): boolean {
    return this.getSetting('auto-show-patch-notes', 'true') === 'true';
  }

  public set autoShowPatchNotes(show: boolean) {
    this.setSetting('auto-show-patch-notes', show.toString());
  }

  public get tutorialEnabled(): boolean {
    return this.getSetting('tutorial:enabled', 'false') === 'true';
  }

  public set tutorialEnabled(enabled: boolean) {
    this.setSetting('tutorial:enabled', enabled.toString());
  }

  public get tutorialQuestionAsked(): boolean {
    return this.getSetting('tutorial:asked', 'false') === 'true';
  }

  public set tutorialQuestionAsked(asked: boolean) {
    this.setSetting('tutorial:asked', asked.toString());
  }

  public set commissionTags(tags: CommissionTag[]) {
    this.setSetting('commission:tags', JSON.stringify(tags));
  }

  public get commissionTags(): CommissionTag[] {
    return JSON.parse(this.getSetting('commissions:tags', '[]'));
  }

  public get onlyCraftingCommissions(): boolean {
    return this.getSetting('commissions:onlyCrafting', 'false') === 'true';
  }

  public set onlyCraftingCommissions(onlyCrafting: boolean) {
    this.setSetting('commissions:onlyCrafting', onlyCrafting.toString());
  }

  public get onlyMaterialsCommissions(): boolean {
    return this.getSetting('commissions:onlyMaterials', 'false') === 'true';
  }

  public set onlyMaterialsCommissions(onlyMaterials: boolean) {
    this.setSetting('commissions:onlyMaterials', onlyMaterials.toString());
  }

  public get minCommissionPrice(): number {
    return +this.getSetting('commissions:minPrice', '0');
  }

  public set minCommissionPrice(price: number) {
    this.setSetting('commissions:minPrice', price.toString());
  }

  public get autoDownloadUpdate(): boolean {
    return this.getSetting('auto-download-update', 'true') === 'true';
  }

  public set autoDownloadUpdate(dl: boolean) {
    this.setSetting('auto-download-update', dl.toString());
  }

  public get hideOverlayCompleted(): boolean {
    return this.getSetting('hideOverlayCompleted', 'false') === 'true';
  }

  public set hideOverlayCompleted(hide: boolean) {
    this.setSetting('hideOverlayCompleted', hide.toString());
  }

  public get removeDoneInInventorSynthesis(): boolean {
    return this.getSetting('remove-done-in-synthesis', 'false') === 'true';
  }

  public set removeDoneInInventorSynthesis(remove: boolean) {
    this.setSetting('remove-done-in-synthesis', remove.toString());
  }

  public get preferredCopyType(): string {
    return this.getSetting('copy-type', 'classic');
  }

  public set preferredCopyType(copyType: string) {
    this.setSetting('copy-type', copyType);
  }

  public get lastChangesSeen(): string {
    return this.getSetting('last-changes-seen', '1.0.0');
  }

  public set lastChangesSeen(version: string) {
    this.setSetting('last-changes-seen', version);
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

  public get maximumVendorPrice(): number {
    return +this.getSetting('maximum-vendor-price', '0');
  }

  public set maximumVendorPrice(price: number) {
    this.setSetting('maximum-vendor-price', price.toString());
  }

  public get pageViews(): number {
    return +this.getSetting('page-views', '0');
  }

  public set pageViews(views: number) {
    this.setSetting('page-views', views.toString());
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

  public get ignoredInventories(): string[] {
    return JSON.parse(this.getSetting('ignored-inventories', '[]'));
  }

  public set ignoredInventories(ignored: string[]) {
    this.setSetting('ignored-inventories', JSON.stringify(ignored));
  }

  public get sidebarState(): { [index: string]: boolean } {
    return JSON.parse(this.getSetting('sidebar-state', JSON.stringify({
      general: true,
      sharing: true,
      commissions: true,
      gathering: true,
      helpers: false,
      other: false
    })));
  }

  public set sidebarState(state: { [index: string]: boolean }) {
    this.setSetting('sidebar-state', JSON.stringify(state));
  }

  public get autoMarkAsCompleted(): boolean {
    return this.getSetting('auto-mark-as-completed', 'false') === 'true';
  }

  public set autoMarkAsCompleted(markAsCompleted: boolean) {
    this.setSetting('auto-mark-as-completed', markAsCompleted.toString());
  }

  public get onlyRecipesInPicker(): boolean {
    return this.getSetting('only-recipes-in-picker', 'false') === 'true';
  }

  public set onlyRecipesInPicker(onlyRecipes: boolean) {
    this.setSetting('only-recipes-in-picker', onlyRecipes.toString());
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

  public get alwaysAllDeliveries(): boolean {
    return this.getSetting('always-all-deliveries', 'false') === 'true';
  }

  public set alwaysAllDeliveries(alwaysAllDeliveries: boolean) {
    this.setSetting('always-all-deliveries', alwaysAllDeliveries.toString());
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

  public get disableHQSuggestions(): boolean {
    return this.getSetting('lists:disable-hq-suggestion', 'false') === 'true';
  }

  public set disableHQSuggestions(disabled: boolean) {
    this.setSetting('lists:disable-hq-suggestion', disabled.toString());
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

  public get ignoreCompletedItemInPricing(): boolean {
    return this.getSetting('pricing:ignore-completed-items', 'false') === 'true';
  }

  public set ignoreCompletedItemInPricing(ignore: boolean) {
    this.setSetting('pricing:ignore-completed-items', ignore.toString());
  }

  public get theme(): Theme {
    const themeName = this.getSetting('theme', 'DEFAULT');
    if (themeName === 'CUSTOM') {
      return this.customTheme;
    }
    return Theme.byName(themeName) || Theme.byName('DEFAULT');
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

  public get playerMetricsEnabled(): boolean {
    return this.getSetting('playerMetricsEnabled', 'false') === 'true';
  }

  public set playerMetricsEnabled(enabled: boolean) {
    this.setSetting('playerMetricsEnabled', enabled.toString());
  }

  public get pcapLogEnabled(): boolean {
    return this.getSetting('pcapLogEnabled', 'true') === 'true';
  }

  public set pcapLogEnabled(enabled: boolean) {
    this.setSetting('pcapLogEnabled', enabled.toString());
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

  public get enableAutofillNQFilter(): boolean {
    return this.getSetting('autofill:enable-nq-filter', 'false') === 'true';
  }

  public set enableAutofillNQFilter(enabled: boolean) {
    this.setSetting('autofill:enable-nq-filter', enabled.toString());
  }

  public get enableUniversalisSourcing(): boolean {
    return this.getSetting('universalis:enable-sourcing', 'false') === 'true';
  }

  public set enableUniversalisSourcing(enabled: boolean) {
    this.setSetting('universalis:enable-sourcing', enabled.toString());
  }

  public get winpcap(): boolean {
    return this.getSetting('winpcap', 'false') === 'true';
  }

  public set winpcap(enabled: boolean) {
    this.setSetting('winpcap', enabled.toString());
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

  public get macroCompletionMessage(): string {
    return this.getSetting('macroCompletionMessage', 'Craft finished');
  }

  public set macroCompletionMessage(completionMessage: string) {
    this.setSetting('macroCompletionMessage', completionMessage);
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

  public get xivapiKey(): string {
    return this.getSetting('xivapiKey', '');
  }

  public set xivapiKey(key: string) {
    this.setSetting('xivapiKey', key);
  }

  public get enableMappy(): boolean {
    return this.getSetting('enableMappy', 'true') === 'true';
  }

  public set enableMappy(enabled: boolean) {
    this.setSetting('enableMappy', enabled.toString());
  }

  public get macroConsumables(): boolean {
    return this.getSetting('macroConsumables', 'true') === 'true';
  }

  public set macroConsumables(addConsumables: boolean) {
    this.setSetting('macroConsumables', addConsumables.toString());
  }

  public get addConsumablesWaitTime(): number {
    return +this.getSetting('addConsumablesWaitTime', '5');
  }

  public set addConsumablesWaitTime(addConsumablesWaitTime: number) {
    this.setSetting('addConsumablesWaitTime', addConsumablesWaitTime.toString());
  }

  public get macroBreakBeforeByregot(): boolean {
    return this.getSetting('macroBreakBeforeByregot', 'false') === 'true';
  }

  public set macroBreakBeforeByregot(breakBeforeByregot: boolean) {
    this.setSetting('macroBreakBeforeByregot', breakBeforeByregot.toString());
  }

  public setOverlayClockDisplay(overlay: string, show: boolean): void {
    this.setSetting(`overlay:clock:${overlay}`, show.toString());
  }

  public getOverlayClockDisplay(overlay: string): boolean {
    return this.getSetting(`overlay:clock:${overlay}`, 'true') === 'true';
  }

  private getSetting(name: string, defaultValue: string): string {
    return this.cache[name] || defaultValue;
  }

  private setSetting(name: string, value: string): void {
    this.cache[name] = value;
    localStorage.setItem('settings', JSON.stringify(this.cache));
    this.ipc.send('apply-settings', { ...this.cache });
    this.settingsChange$.next(name);
  }

}
