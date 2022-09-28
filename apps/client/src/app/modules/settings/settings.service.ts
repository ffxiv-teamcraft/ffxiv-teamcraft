import { Injectable, Optional } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Theme } from './theme';
import { IpcService } from '../../core/electron/ipc.service';
import { Region } from './region.enum';
import { filter, map, startWith } from 'rxjs/operators';
import { CommissionTag } from '../commission-board/model/commission-tag';
import { Language } from '../../core/data/language';
import { NotificationSettings } from './notification-settings';
import { SoundNotificationType } from '../../core/sound-notification/sound-notification-type';
import { IS_HEADLESS } from '../../../environments/is-headless';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public regionChange$ = new Subject<{ previous: Region, next: Region }>();

  public region$: Observable<Region>;

  public themeChange$ = new Subject<{ previous: Theme, next: Theme }>();

  public settingsChange$ = new Subject<string>();

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

  private _cache: Record<string, string>;

  public get cache(): Record<string, string> {
    return this._cache;
  }

  public set cache(cache: Record<string, string>) {
    this._cache = cache;
    localStorage.setItem('settings', JSON.stringify(this.cache));
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
    return this.getBoolean('region:hide-banner', false);
  }

  public set hideRegionBanner(hide: boolean) {
    this.setSetting('region:hide-banner', hide.toString());
  }

  public get showOnlyCraftableInRecipeFinder(): boolean {
    return this.getBoolean('recipe-finder:only-craftable', false);
  }

  public set showOnlyCraftableInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:only-craftable', show.toString());
  }

  public get addResultToPoolInRecipeFinder(): boolean {
    return this.getBoolean('recipe-finder:add-results-to-pool', false);
  }

  public set addResultToPoolInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:add-results-to-pool', show.toString());
  }

  public get showOnlyNotCompletedInRecipeFinder(): boolean {
    return this.getBoolean('recipe-finder:only-not-completed', false);
  }

  public set showOnlyNotCompletedInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:only-not-completed', show.toString());
  }

  public get showOnlyCollectablesInRecipeFinder(): boolean {
    return this.getBoolean('recipe-finder:only-collectables', false);
  }

  public set showOnlyCollectablesInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:only-collectables', show.toString());
  }

  public get showOnlyLeveItemsInRecipeFinder(): boolean {
    return this.getBoolean('recipe-finder:only-leves', false);
  }

  public set showOnlyLeveItemsInRecipeFinder(show: boolean) {
    this.setSetting('recipe-finder:only-leves', show.toString());
  }

  public get configurationPanelExpanded(): boolean {
    return this.getBoolean('simulation:configuration:expanded', true);
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
    return this.getBoolean('simulation:actions:detailed', false);
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
    return this.getBoolean('auto-open-in-desktop', true);
  }

  public set autoOpenInDesktop(open: boolean) {
    this.setSetting('auto-open-in-desktop', open.toString());
  }

  public get autoShowPatchNotes(): boolean {
    return this.getBoolean('auto-show-patch-notes', true);
  }

  public set autoShowPatchNotes(show: boolean) {
    this.setSetting('auto-show-patch-notes', show.toString());
  }

  public get tutorialEnabled(): boolean {
    return this.getBoolean('tutorial:enabled', false);
  }

  public set tutorialEnabled(enabled: boolean) {
    this.setSetting('tutorial:enabled', enabled.toString());
  }

  public get tutorialQuestionAsked(): boolean {
    return this.getBoolean('tutorial:asked', false);
  }

  public set tutorialQuestionAsked(asked: boolean) {
    this.setSetting('tutorial:asked', asked.toString());
  }

  public get commissionTags(): CommissionTag[] {
    return JSON.parse(this.getSetting('commissions:tags', '[]'));
  }

  public set commissionTags(tags: CommissionTag[]) {
    this.setSetting('commissions:tags', JSON.stringify(tags));
  }

  public get foldersOpened(): Record<string, 1> {
    return JSON.parse(this.getSetting('folders:opened', '{}'));
  }

  public set foldersOpened(folders: Record<string, 1>) {
    this.setSetting('folders:opened', JSON.stringify(folders));
  }

  public get ignoredContentIds(): string[] {
    return JSON.parse(this.getSetting('inventory:ignored-content-ids', '[]'));
  }

  public set ignoredContentIds(ids: string[]) {
    this.setSetting('inventory:ignored-content-ids', JSON.stringify(ids));
  }

  public get onlyCraftingCommissions(): boolean {
    return this.getBoolean('commissions:onlyCrafting', false);
  }

  public set onlyCraftingCommissions(onlyCrafting: boolean) {
    this.setSetting('commissions:onlyCrafting', onlyCrafting.toString());
  }

  public get onlyMaterialsCommissions(): boolean {
    return this.getBoolean('commissions:onlyMaterials', false);
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

  public get islandWorkshopRestDay(): number {
    return +this.getSetting('island-workshop:rest-day', '1');
  }

  public set islandWorkshopRestDay(day: number) {
    this.setSetting('island-workshop:rest-day', day.toString());
  }

  public get materiaConfidenceRate(): number {
    return +this.getSetting('materias:confidence', '0.5');
  }

  public set materiaConfidenceRate(rate: number) {
    this.setSetting('materias:confidence', rate.toString());
  }

  public get autoDownloadUpdate(): boolean {
    return this.getBoolean('auto-download-update', true);
  }

  public set autoDownloadUpdate(dl: boolean) {
    this.setSetting('auto-download-update', dl.toString());
  }

  public get hideBackButton(): boolean {
    return this.getBoolean('hideBackButton', false);
  }

  public set hideBackButton(hide: boolean) {
    this.setBoolean('hideBackButton', hide);
  }

  public get hideOverlayCompleted(): boolean {
    return this.getBoolean('hideOverlayCompleted', false);
  }

  public set hideOverlayCompleted(hide: boolean) {
    this.setSetting('hideOverlayCompleted', hide.toString());
  }

  public get removeDoneInInventorSynthesis(): boolean {
    return this.getBoolean('remove-done-in-synthesis', false);
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

  public get maximumTotalVendorPrice(): number {
    return +this.getSetting('maximum-total-vendor-price', '0');
  }

  public set maximumTotalVendorPrice(price: number) {
    this.setSetting('maximum-total-vendor-price', price.toString());
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
    return IS_HEADLESS ? true : this.getBoolean('compact-sidebar', false);
  }

  public set compactSidebar(compact: boolean) {
    this.setSetting('compact-sidebar', compact.toString());
  }

  public get hasAccessToHousingVendors(): boolean {
    return this.getBoolean('hasAccessToHousingVendors', false);
  }

  public set hasAccessToHousingVendors(enabled: boolean) {
    this.setBoolean('hasAccessToHousingVendors', enabled);
  }

  public get makeQuickListsOffline(): boolean {
    return this.getBoolean('makeQuickListsOffline', false);
  }

  public set makeQuickListsOffline(enabled: boolean) {
    this.setBoolean('makeQuickListsOffline', enabled);
  }

  public get ignoredInventories(): string[] {
    return JSON.parse(this.getSetting('ignored-inventories', '[]'));
  }

  public set ignoredInventories(ignored: string[]) {
    this.setSetting('ignored-inventories', JSON.stringify(ignored));
  }

  public get sidebarState(): { [index: string]: boolean } {
    return JSON.parse(this.getSetting('sidebar-state', JSON.stringify({
      favorites: true,
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

  public get sidebarFavorites(): string[] {
    return JSON.parse(this.getSetting('sidebar-favorites', JSON.stringify([])));
  }

  public set sidebarFavorites(favorites: string[]) {
    this.setSetting('sidebar-favorites', JSON.stringify(favorites));
  }

  public get autoMarkAsCompleted(): boolean {
    return this.getBoolean('auto-mark-as-completed', false);
  }

  public set autoMarkAsCompleted(markAsCompleted: boolean) {
    this.setSetting('auto-mark-as-completed', markAsCompleted.toString());
  }

  public get onlyRecipesInPicker(): boolean {
    return this.getBoolean('only-recipes-in-picker', false);
  }

  public set onlyRecipesInPicker(onlyRecipes: boolean) {
    this.setSetting('only-recipes-in-picker', onlyRecipes.toString());
  }

  public get clickthroughOverlay(): boolean {
    return this.getBoolean('clickthrough', false);
  }

  public set clickthroughOverlay(clickthrough: boolean) {
    this.setSetting('clickthrough', clickthrough.toString());
  }

  public get alwaysHQLeves(): boolean {
    return this.getBoolean('always-hq-leves', false);
  }

  public set alwaysHQLeves(alwaysHqLeves: boolean) {
    this.setSetting('always-hq-leves', alwaysHqLeves.toString());
  }

  public get alwaysAllDeliveries(): boolean {
    return this.getBoolean('always-all-deliveries', false);
  }

  public set alwaysAllDeliveries(alwaysAllDeliveries: boolean) {
    this.setSetting('always-all-deliveries', alwaysAllDeliveries.toString());
  }

  public get compactAlarms(): boolean {
    return this.getBoolean('compact-alarms', false);
  }

  public set compactAlarms(compact: boolean) {
    this.setSetting('compact-alarms', compact.toString());
  }

  public get performanceMode(): boolean {
    return this.getBoolean('lists:perf-mode', false);
  }

  public set performanceMode(enabled: boolean) {
    this.setSetting('lists:perf-mode', enabled.toString());
  }

  public get hideLargeListMessage(): boolean {
    return this.getBoolean('lists:hide-large-list-message', false);
  }

  public set hideLargeListMessage(hidden: boolean) {
    this.setSetting('lists:hide-large-list-message', hidden.toString());
  }

  public get disableHQSuggestions(): boolean {
    return this.getBoolean('lists:disable-hq-suggestion', false);
  }

  public set disableHQSuggestions(disabled: boolean) {
    this.setSetting('lists:disable-hq-suggestion', disabled.toString());
  }

  public get disableSearchHistory(): boolean {
    return this.getBoolean('disable-search-history', false);
  }

  public set disableSearchHistory(disabled: boolean) {
    this.setSetting('disable-search-history', disabled.toString());
  }

  public get disableSearchDebounce(): boolean {
    return this.getBoolean('disable-search-debounce', false);
  }

  public set disableSearchDebounce(disabled: boolean) {
    this.setSetting('disable-search-debounce', disabled.toString());
  }

  public get expectToSellEverything(): boolean {
    return this.getBoolean('pricing:expect-sell-all', false);
  }

  public set expectToSellEverything(sellEverything: boolean) {
    this.setSetting('pricing:expect-sell-all', sellEverything.toString());
  }

  public get ignoreCompletedItemInPricing(): boolean {
    return this.getBoolean('pricing:ignore-completed-items', false);
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

  public get alarmsMuted(): boolean {
    return this.getBoolean('alarms:muted', false);
  }

  public set alarmsMuted(muted: boolean) {
    this.setSetting('alarms:muted', muted.toString());
  }

  public get noPanelBorders(): boolean {
    return this.getBoolean('noPanelBorders', false);
  }

  public set noPanelBorders(borders: boolean) {
    this.setSetting('noPanelBorders', borders.toString());
  }

  public get itemTagsEnabled(): boolean {
    return this.getBoolean('itemTagsEnabled', false);
  }

  public set itemTagsEnabled(tagsEnabled: boolean) {
    this.setSetting('itemTagsEnabled', tagsEnabled.toString());
  }

  public get alarmGroupsBeforeNoGroup(): boolean {
    return this.getBoolean('alarmGroupsBeforeNoGroups', false);
  }

  public set alarmGroupsBeforeNoGroup(bool: boolean) {
    this.setBoolean('alarmGroupsBeforeNoGroups', bool);
  }

  public get playerMetricsEnabled(): boolean {
    return this.getBoolean('playerMetricsEnabled', false);
  }

  public set playerMetricsEnabled(enabled: boolean) {
    this.setSetting('playerMetricsEnabled', enabled.toString());
  }

  public get pcapLogEnabled(): boolean {
    return this.getBoolean('pcapLogEnabled', true);
  }

  public set pcapLogEnabled(enabled: boolean) {
    this.setSetting('pcapLogEnabled', enabled.toString());
  }

  public get showAllAlarms(): boolean {
    return this.getBoolean('showAllAlarms', false);
  }

  public set showAllAlarms(showAllAlarms: boolean) {
    this.setSetting('showAllAlarms', showAllAlarms.toString());
  }

  public get displayRemaining(): boolean {
    return this.getBoolean('displayRemaining', false);
  }

  public set displayRemaining(displayRemaining: boolean) {
    this.setSetting('displayRemaining', displayRemaining.toString());
  }

  public get disableCrossWorld(): boolean {
    return this.getBoolean('disableCrossWorld', false);
  }

  public set disableCrossWorld(disableCrossWorld: boolean) {
    this.setSetting('disableCrossWorld', disableCrossWorld.toString());
  }

  public get showCopyOnOwnList(): boolean {
    return this.getBoolean('showCopyOnOwnList', false);
  }

  public set showCopyOnOwnList(tagsEnabled: boolean) {
    this.setSetting('showCopyOnOwnList', tagsEnabled.toString());
  }

  public get hideMachinaBanner(): boolean {
    return this.getBoolean('machina:hide-banner', false);
  }

  public set hideMachinaBanner(hide: boolean) {
    this.setSetting('machina:hide-banner', hide.toString());
  }

  public get enableAutofillByDefault(): boolean {
    return this.getBoolean('autofill:enable-by-default', false);
  }

  public set enableAutofillByDefault(enable: boolean) {
    this.setSetting('autofill:enable-by-default', enable.toString());
  }

  public get enableAutofillNotificationByDefault(): boolean {
    return this.getBoolean('autofill:enable-notification-by-default', false);
  }

  public set enableAutofillNotificationByDefault(enable: boolean) {
    this.setSetting('autofill:enable-notification-by-default', enable.toString());
  }

  public get enableAutofillHQFilter(): boolean {
    return this.getBoolean('autofill:enable-hq-filter', false);
  }

  public set enableAutofillHQFilter(enabled: boolean) {
    this.setSetting('autofill:enable-hq-filter', enabled.toString());
  }

  public get enableAutofillNQFilter(): boolean {
    return this.getBoolean('autofill:enable-nq-filter', false);
  }

  public set enableAutofillNQFilter(enabled: boolean) {
    this.setSetting('autofill:enable-nq-filter', enabled.toString());
  }

  public get clearInventoryOnStartup(): boolean {
    return this.getBoolean('inventory:clear-on-startup', false);
  }

  public set clearInventoryOnStartup(clear: boolean) {
    this.setBoolean('inventory:clear-on-startup', clear);
  }

  public get enableUniversalisSourcing(): boolean {
    return this.getBoolean('universalis:enable-sourcing', false);
  }

  public set enableUniversalisSourcing(enabled: boolean) {
    this.setSetting('universalis:enable-sourcing', enabled.toString());
  }

  public get winpcap(): boolean {
    return this.getBoolean('winpcap', false);
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
    return this.getBoolean('hideLargeLeves', false);
  }

  public set hideLargeLeves(hideLargeLeves: boolean) {
    this.setSetting('hideLargeLeves', hideLargeLeves.toString());
  }

  public get roadToBuffLeves(): boolean {
    return this.getBoolean('roadToBuffLeves', false);
  }

  public set roadToBuffLeves(roadToBuffLeves: boolean) {
    this.setBoolean('roadToBuffLeves', roadToBuffLeves);
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
    return this.getBoolean('macroEcho', true);
  }

  public set macroEcho(echo: boolean) {
    this.setSetting('macroEcho', echo.toString());
  }

  public get macroFixedEcho(): boolean {
    return this.getBoolean('macroFixedEcho', false);
  }

  public set macroFixedEcho(fixedEcho: boolean) {
    this.setSetting('macroFixedEcho', fixedEcho.toString());
  }

  public get macroLock(): boolean {
    return this.getBoolean('macroLock', false);
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
    return this.getBoolean('enableMappy', true);
  }

  public set enableMappy(enabled: boolean) {
    this.setSetting('enableMappy', enabled.toString());
  }

  public get macroConsumables(): boolean {
    return this.getBoolean('macroConsumables', true);
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
    return this.getBoolean('macroBreakBeforeByregot', false);
  }

  public set macroBreakBeforeByregot(breakBeforeByregot: boolean) {
    this.setSetting('macroBreakBeforeByregot', breakBeforeByregot.toString());
  }

  public get followIngameCharacterSwitches(): boolean {
    return this.getBoolean('followIngameCharacterSwitches', true);
  }

  public set followIngameCharacterSwitches(follow: boolean) {
    this.setBoolean('followIngameCharacterSwitches', follow);
  }

  public get autoUpdateStats(): boolean {
    return this.getBoolean('autoUpdateStats', false);
  }

  public set autoUpdateStats(update: boolean) {
    this.setBoolean('autoUpdateStats', update);
  }

  public get showOthercharacterInventoriesInList(): boolean {
    return this.getBoolean('showOthercharacterInventoriesInList', true);
  }

  public set showOthercharacterInventoriesInList(show: boolean) {
    this.setBoolean('showOthercharacterInventoriesInList', show);
  }

  public get showOthercharacterInventoriesInInventoryPage(): boolean {
    return this.getBoolean('showOthercharacterInventoriesInInventoryPage', true);
  }

  public set showOthercharacterInventoriesInInventoryPage(show: boolean) {
    this.setBoolean('showOthercharacterInventoriesInInventoryPage', show);
  }

  public get retainerTaskAlarms(): boolean {
    return this.getBoolean('retainerTaskAlarms', false);
  }

  public set retainerTaskAlarms(enabled: boolean) {
    this.setBoolean('retainerTaskAlarms', enabled);
  }

  public get vesselVoyageAlarms(): boolean {
    return this.getBoolean('vesselVoyageAlarms', false);
  }

  public set vesselVoyageAlarms(enabled: boolean) {
    this.setBoolean('vesselVoyageAlarms', enabled);
  }

  public get hideCompletedLogEntries(): boolean {
    return this.getBoolean('hideCompletedLogEntries', false);
  }

  public set hideCompletedLogEntries(enabled: boolean) {
    this.setBoolean('hideCompletedLogEntries', enabled);
  }

  public get showNotRequiredLogEntries(): boolean {
    return this.getBoolean('showNotRequiredLogEntries', false);
  }

  public set showNotRequiredLogEntries(enabled: boolean) {
    this.setBoolean('showNotRequiredLogEntries', enabled);
  }

  public get showSearchFilters(): boolean {
    return this.getBoolean('showSearchFilters', false);
  }

  public set showSearchFilters(enabled: boolean) {
    this.setBoolean('showSearchFilters', enabled);
  }

  public get localFishingDataDump(): boolean {
    return this.getBoolean('localFishingDataDump', false);
  }

  public set localFishingDataDump(enabled: boolean) {
    this.setBoolean('localFishingDataDump', enabled);
  }

  public setOverlayClockDisplay(overlay: string, show: boolean): void {
    this.setSetting(`overlay:clock:${overlay}`, show.toString());
  }

  public getOverlayClockDisplay(overlay: string): boolean {
    return this.getBoolean(`overlay:clock:${overlay}`, true);
  }

  public get TTSAlarms(): boolean {
    return this.getBoolean('alarms:tts', false);
  }

  public set TTSAlarms(enabled: boolean) {
    this.setBoolean('alarms:tts', enabled);
  }

  public getBoolean(name: string, defaultValue: boolean): boolean {
    return this.getSetting(name, defaultValue.toString()) === 'true';
  }

  public setBoolean(name: string, value: boolean): void {
    this.setSetting(name, value.toString());
  }

  public getString(name: string, defaultValue: string): string {
    return this.getSetting(name, defaultValue);
  }

  public setString(name: string, value: string): void {
    this.setSetting(name, value);
  }

  public getNotificationSettings(type: SoundNotificationType): NotificationSettings {
    const raw = this.getString(`alarm-settings:${type}`, '');
    if (!!raw) {
      return JSON.parse(raw);
    } else {
      return {
        volume: 0.5,
        sound: 'Notification'
      };
    }
  }

  public watchSetting<T>(setting: string, defaultValue: T): Observable<T> {
    return this.settingsChange$.pipe(
      filter(change => change === setting),
      map((change) => {
        // Switch because I expect more specific types handling in the future
        switch (typeof defaultValue) {
          case 'string':
            return this._cache[change];
          case 'number':
            return +this._cache[change];
          default:
            return JSON.parse(this._cache[change]);
        }
      }),
      startWith(defaultValue)
    );
  }

  public setNotificationSettings(type: SoundNotificationType, settings: NotificationSettings): void {
    this.setString(`alarm-settings:${type}`, JSON.stringify(settings));
  }

  private getSetting(name: string, defaultValue: string): string {
    return this.cache[name] || defaultValue;
  }

  private setSetting(name: string, value: string): void {
    this._cache[name] = value;
    localStorage.setItem('settings', JSON.stringify(this._cache));
    if (this.ipc) {
      this.ipc.send('apply-settings', { ...this._cache });
    }
    this.settingsChange$.next(name);
  }

}
