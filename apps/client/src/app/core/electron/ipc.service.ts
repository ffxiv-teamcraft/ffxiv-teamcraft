import { Injectable, NgZone } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcRendererEvent } from 'electron';
import { Router } from '@angular/router';
import { Vector2 } from '@ffxiv-teamcraft/types';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, first, map, pairwise, switchMap } from 'rxjs/operators';
import { ofMessageType } from '../rxjs/of-message-type';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { NpcapInstallPopupComponent } from '../../modules/ipc-popups/npcap-install-popup/npcap-install-popup.component';
import type { FreeCompanyDialog, Message } from '@ffxiv-teamcraft/pcap-ffxiv/models';
import { toIpcData } from '../rxjs/to-ipc-data';
import { UpdateInstallPopupComponent } from '../../modules/ipc-popups/update-install-popup/update-install-popup.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PacketCaptureStatus } from './packet-capture-status';

type EventCallback = (event: IpcRendererEvent, ...args: any[]) => void;

interface IPC {
  send(channel: string, ...data: any[]): void;

  on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void;

  once(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void): void;


  removeAllListeners(channel: string): void;

  init(): void;
}

declare global {
  interface Window {
    ipc: IPC;
  }
}

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  public static readonly ROTATION_DEFAULT_DIMENSIONS = { x: 600, y: 200 };

  public readonly pcapStatus$ = new BehaviorSubject<PacketCaptureStatus>(PacketCaptureStatus.STOPPED);

  public packets$ = new Subject<Message>();

  public pcapToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public fishingState$: ReplaySubject<any> = new ReplaySubject<any>();

  public mainWindowState$: ReplaySubject<any> = new ReplaySubject<any>();

  private readonly _ipc: IPC | undefined = undefined;

  private totalPacketsHandled = 0;

  private start = Date.now();

  private stateSubscription: Subscription;

  public pcapStopped$: Observable<void> = this.pcapStatus$.pipe(
    pairwise(),
    filter(([before, after]) => before === PacketCaptureStatus.RUNNING && (after === PacketCaptureStatus.STOPPED || after === PacketCaptureStatus.ERROR)),
    map(() => void 0)
  );

  private readonly _isChildWindow: boolean;

  public get isChildWindow(): boolean {
    return this._isChildWindow;
  }

  constructor(private platformService: PlatformService, private router: Router,
              private store: Store<any>, private zone: NgZone, private dialog: NzModalService,
              private translate: TranslateService, private notification: NzNotificationService,
              private message: NzMessageService) {
    // Only load ipc if we're running inside electron
    if (platformService.isDesktop()) {
      this._isChildWindow = window.location.toString().includes('?child=true');
      if (window.ipc) {
        this._ipc = window.ipc;
        this._ipc.init();
        this.connectListeners();
      } else {
        console.warn('Electron\'s IPC was not loaded');
      }
    }
  }

  public get ready(): boolean {
    return this._ipc !== undefined;
  }

  public get available(): boolean {
    return this.platformService.isDesktop();
  }

  public get itemInfoPackets$() {
    return this.packets$.pipe(
      ofMessageType('itemInfo'),
      toIpcData()
    );
  }

  public get islandWorkshopSupplyDemandPackets$() {
    return this.packets$.pipe(
      ofMessageType('islandWorkshopSupplyDemand'),
      toIpcData()
    );
  }

  public get updateInventorySlotPackets$() {
    return this.packets$.pipe(
      ofMessageType('updateInventorySlot'),
      toIpcData()
    );
  }

  public get playerSetupPackets$() {
    return this.packets$.pipe(
      ofMessageType('playerSetup'),
      toIpcData()
    );
  }

  public get worldId$(): Observable<number> {
    return this.packets$.pipe(
      ofMessageType('playerSpawn'),
      filter(packet => packet.header.sourceActor === packet.header.targetActor),
      toIpcData(),
      map(packet => {
        return packet.currentWorldId;
      })
    );
  }

  public get freeCompanyId$(): Observable<string> {
    return this.packets$.pipe(
      ofMessageType('freeCompanyInfo'),
      toIpcData(),
      map(packet => packet.freeCompanyId.toString())
    );
  }

  public get freeCompanyDetails$(): Observable<FreeCompanyDialog> {
    return this.packets$.pipe(
      ofMessageType('freeCompanyDialog'),
      toIpcData()
    );
  }

  public get marketTaxRatePackets$() {
    return this.packets$.pipe(
      ofMessageType('resultDialog', 'marketTaxRates'),
      toIpcData()
    );
  }

  public get marketBoardSearchResult$() {
    return this.packets$.pipe(
      ofMessageType('marketBoardSearchResult'),
      toIpcData()
    );
  }

  public get marketboardListingCount$() {
    return this.packets$.pipe(
      ofMessageType('marketBoardItemListingCount'),
      toIpcData()
    );
  }

  public get marketboardListing$() {
    return this.packets$.pipe(
      ofMessageType('marketBoardItemListing'),
      toIpcData()
    );
  }

  public get marketboardListingHistory$() {
    return this.packets$.pipe(
      ofMessageType('marketBoardItemListingHistory'),
      toIpcData()
    );
  }

  public get marketBoardPurchaseHandler$() {
    return this.packets$.pipe(
      ofMessageType('marketBoardPurchaseHandler'),
      toIpcData()
    );
  }

  public get marketBoardPurchase$() {
    return this.packets$.pipe(
      ofMessageType('marketBoardPurchase'),
      toIpcData()
    );
  }

  public get npcSpawnPackets$() {
    return this.packets$.pipe(
      ofMessageType('npcSpawn'),
      toIpcData()
    );
  }

  public get objectSpawnPackets$() {
    return this.packets$.pipe(
      ofMessageType('objectSpawn'),
      toIpcData()
    );
  }

  public get retainerInformationPackets$() {
    return this.packets$.pipe(
      ofMessageType('retainerInformation'),
      toIpcData()
    );
  }

  public get submarineProgressionStatusPackets$() {
    return this.packets$.pipe(
      ofMessageType('submarineProgressionStatus'),
      toIpcData()
    );
  }

  public get submarinesStatusListPackets$() {
    return this.packets$.pipe(
      ofMessageType('submarineStatusList'),
      toIpcData()
    );
  }

  public get airshipStatusPackets$() {
    return this.packets$.pipe(
      ofMessageType('airshipStatus'),
      toIpcData()
    );
  }

  public get airshipStatusListPackets$() {
    return this.packets$.pipe(
      ofMessageType('airshipStatusList'),
      toIpcData()
    );
  }

  public get updatePositionHandlerPackets$() {
    return this.packets$.pipe(
      ofMessageType('updatePositionHandler'),
      toIpcData()
    );
  }

  public get updatePositionInstancePackets$() {
    return this.packets$.pipe(
      ofMessageType('updatePositionInstance'),
      toIpcData()
    );
  }

  public get initZonePackets$() {
    return this.packets$.pipe(
      ofMessageType('initZone'),
      toIpcData()
    );
  }

  public get weatherChangePackets$() {
    return this.packets$.pipe(
      ofMessageType('weatherChange'),
      toIpcData()
    );
  }

  public get playerStatsPackets$() {
    return this.packets$.pipe(
      ofMessageType('playerStats'),
      toIpcData()
    );
  }

  public get updateClassInfoPackets$() {
    return this.packets$.pipe(
      ofMessageType('updateClassInfo'),
      toIpcData()
    );
  }

  public get prepareZoningPackets$() {
    return this.packets$.pipe(
      ofMessageType('prepareZoning'),
      toIpcData()
    );
  }

  public get eventPlay4Packets$() {
    return this.packets$.pipe(
      ofMessageType('eventPlay4'),
      toIpcData()
    );
  }

  public get eventPlay8Packets$() {
    return this.packets$.pipe(
      ofMessageType('eventPlay8'),
      toIpcData()
    );
  }

  public get pcapToggle(): boolean {
    return this.pcapToggle$.value;
  }

  private _overlayUri: string;

  public get overlayUri(): string {
    return this._overlayUri;
  }

  public set overlayUri(uri: string) {
    this._overlayUri = uri;
    if (this.ready) {
      this.handleOverlayChange();
    }
  }

  public on(channel: string, cb: EventCallback): void {
    if (this.ready) {
      this._ipc.on(channel, (event, ...args) => {
        this.zone.run(() => cb(event, ...args));
      });
    }
  }

  public once(channel: string, cb: EventCallback): void {
    if (this.ready) {
      this._ipc.once(channel, (event, ...args) => {
        this.zone.run(() => cb(event, ...args));
      });
    }
  }

  public send(channel: string, data?: any): void {
    if (this.ready) {
      return this._ipc.send(channel, data);
    }
  }

  public openOverlay(url: string, registrationUri: string = url, defaultDimensions?: Vector2): void {
    this.send('overlay', {
      url: url,
      registrationUri: registrationUri,
      defaultDimensions: defaultDimensions
    });
  }

  public log(...args: any[]): void {
    this.send('log', args);
  }

  private connectListeners(): void {
    if (this.isChildWindow) {
      return;
    }
    (<any>window).packetsPerSecond = () => {
      const durationSeconds = (Date.now() - this.start) / 1000;
      console.log('Packets per second: ', Math.floor(this.totalPacketsHandled * 10 / durationSeconds) / 10);
    };
    this.on('toggle-pcap:value', (event, value) => {
      this.pcapToggle$.next(value);
    });
    this.send('toggle-pcap:get');
    this.on('packet', (event, message: Message) => {
      this.handleMessage(message);
    });
    this.on('pcap:error', (event, error: { message: string }) => {
      this.handlePcapError(error);
    });
    this.on('pcap:error:raw', (event, error: { message: string, code?: string, retryDelay: number }) => {
      console.log(error.message);
      if (error.code === 'DEUCALION_NOT_FOUND') {
        this.notification.error(
          this.translate.instant(`PCAP_ERRORS.Default`),
          this.translate.instant(`PCAP_ERRORS.DEUCALION_NOT_FOUND`),
          {
            nzDuration: 60000
          }
        );
      }
    });
    this.on('metrics:importing', () => {
      this.message.info(this.translate.instant('METRICS.Importing'), {
        nzDuration: 0
      });
    });
    this.on('metrics:imported', () => {
      this.message.remove();
      this.message.info(this.translate.instant('METRICS.Imported'), {
        nzDuration: 10000
      });
    });
    this.on('navigate', (event, url: string) => {
      console.log('NAVIGATE', url);
      // eslint-disable-next-line prefer-const
      let [path, params] = url.split('?');
      if (path.endsWith('/')) {
        path = path.substr(0, url.length - 1);
      }
      if (url.startsWith('/')) {
        path = path.substr(1);
      }
      if (params) {
        const queryParams = new URLSearchParams(params);
        this.router.navigate(path.split('/'), { queryParams });
      } else {
        this.router.navigate(path.split('/'));
      }
    });
    this.on('fishing-state', (event, data) => this.fishingState$.next(data));
    this.on('install-npcap-prompt', () => {
      this.translate.get('PACKET_CAPTURE.Install_npcap')
        .pipe(
          first(),
          switchMap(title => {
            return this.dialog.create({
              nzFooter: null,
              nzTitle: title,
              nzContent: NpcapInstallPopupComponent
            }).afterClose;
          })
        )
        .subscribe(res => {
          switch (res) {
            case 'install':
              this.send('install-npcap', false);
              break;
            case 'disable':
              this.send('toggle-pcap', false);
              this.pcapToggle$.next(false);
              break;
          }
        });
    });
    this.on('update-downloaded', () => {
      console.log('UPDATE DOWNLOADED');
      this.translate.get('UPDATE.New_update_available')
        .pipe(
          first(),
          switchMap(title => {
            return this.dialog.create({
              nzFooter: null,
              nzTitle: title,
              nzContent: UpdateInstallPopupComponent
            }).afterClose;
          })
        )
        .subscribe(res => {
          if (res) {
            this.send('install-update');
          }
        });
    });
    this.on('pcap:status', (e, status) => this.pcapStatus$.next(status));
    this.handleOverlayChange();
  }

  private handleOverlayChange(): void {
    if (this.overlayUri) {
      if (this.stateSubscription) {
        this.stateSubscription.unsubscribe();
        delete this.stateSubscription;
      }
      this.on('app-state', (event, state) => {
        this.mainWindowState$.next(state);
      });
      this.send('app-state:get');
    } else {
      this._ipc.removeAllListeners('app-state');
      this.stateSubscription = this.store
        .pipe(
          debounceTime(250),
          distinctUntilChanged()
        )
        .subscribe(state => {
          this.send('app-state:set', {
            lists: JSON.parse(JSON.stringify(state.lists)),
            layouts: JSON.parse(JSON.stringify(state.layouts)),
            eorzea: JSON.parse(JSON.stringify(state.eorzea))
          });
        });
    }
  }

  public sendState(): void {
    this.store
      .pipe(
        first()
      )
      .subscribe(state => {
        this.send('app-state:set', {
          lists: JSON.parse(JSON.stringify(state.lists)),
          layouts: JSON.parse(JSON.stringify(state.layouts)),
          eorzea: JSON.parse(JSON.stringify(state.eorzea))
        });
      });
  }

  private handleMessage(packet: Message): void {
    this.totalPacketsHandled++;
    if (this.pcapStatus$.value !== PacketCaptureStatus.RUNNING) {
      this.pcapStatus$.next(PacketCaptureStatus.RUNNING);
    }
    this.packets$.next(packet);
    const debugPackets = (<any>window).debugPackets;
    if (debugPackets === true || (typeof debugPackets === 'function' && debugPackets(packet))) {
      // eslint-disable-next-line no-restricted-syntax
      console.info(packet.type, packet);
    }
  }

  private handlePcapError(error: { message: string }, raw = false): void {
    if (raw) {
      this.translate.get(`PCAP_ERRORS.Default`).pipe(
        first()
      ).subscribe(title => {
        this.notification.error(
          title,
          error.message,
          {
            nzDuration: 20000
          }
        );
      });
    } else {
      combineLatest([
        this.translate.get(`PCAP_ERRORS.${error.message}`),
        this.translate.get(`PCAP_ERRORS.DESCRIPTION.${error.message}`)
      ]).pipe(
        first()
      ).subscribe(([title, description]) => {
        this.notification.error(
          title,
          description,
          {
            nzDuration: 20000
          }
        );
      });
    }
  }
}
