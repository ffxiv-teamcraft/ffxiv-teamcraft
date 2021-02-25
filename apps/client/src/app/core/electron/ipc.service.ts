import { Injectable, NgZone } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { Router } from '@angular/router';
import { Vector2 } from '../tools/vector2';
import { BehaviorSubject, interval, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { bufferCount, debounce, debounceTime, distinctUntilChanged, first, map, shareReplay, switchMap } from 'rxjs/operators';
import { ofMessageType } from '../rxjs/of-message-type';
import { Store } from '@ngrx/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TranslateService } from '@ngx-translate/core';
import { RawsockAdminErrorPopupComponent } from '../../modules/ipc-popups/rawsock-admin-error-popup/rawsock-admin-error-popup.component';
import { NpcapInstallPopupComponent } from '../../modules/ipc-popups/npcap-install-popup/npcap-install-popup.component';
import { Message } from '@ffxiv-teamcraft/pcap-ffxiv';
import { toIpcData } from '../rxjs/to-ipc-data';

type EventCallback = (event: IpcRendererEvent, ...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  public static readonly ROTATION_DEFAULT_DIMENSIONS = { x: 600, y: 200 };

  private readonly _ipc: IpcRenderer | undefined = undefined;

  private totalPacketsHandled = 0;

  private start = Date.now();

  public packets$ = new Subject<Message>();

  public get ready(): boolean {
    return this._ipc !== undefined;
  }

  public get itemInfoPackets$() {
    return this.packets$.pipe(
      ofMessageType('itemInfo'),
      toIpcData()
    );
  }

  public get updateInventorySlotPackets$() {
    return this.packets$.pipe(
      ofMessageType('updateInventorySlot'),
      toIpcData()
    );
  }

  public get inventoryTransactionPackets$() {
    return this.packets$.pipe(
      ofMessageType('inventoryTransaction'),
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

  public get inventoryModifyHandlerPackets$() {
    return this.packets$.pipe(
      ofMessageType('inventoryModifyHandler'),
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

  public get currencyCrystalInfoPackets$() {
    return this.packets$.pipe(
      ofMessageType('currencyCrystalInfo'),
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

  public get machinaToggle(): boolean {
    return this.machinaToggle$.value;
  }

  public machinaToggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public fishingState$: ReplaySubject<any> = new ReplaySubject<any>();

  public mainWindowState$: ReplaySubject<any> = new ReplaySubject<any>();

  private stateSubscription: Subscription;

  public possibleMissingFirewallRule$ = this.packets$.pipe(
    bufferCount(100),
    first(),
    map(packets => {
      return packets.every(packet => packet.header.operation === 'send');
    }),
    shareReplay(1)
  );

  constructor(private platformService: PlatformService, private router: Router,
              private store: Store<any>, private zone: NgZone, private dialog: NzModalService,
              private translate: TranslateService) {
    // Only load ipc if we're running inside electron
    if (platformService.isDesktop()) {
      if (window.require) {
        try {
          this._ipc = window.require('electron').ipcRenderer;
          this._ipc.setMaxListeners(0);
          this.connectListeners();
        } catch (e) {
          throw e;
        }
      } else {
        console.warn('Electron\'s IPC was not loaded');
      }
    }
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

  private connectListeners(): void {
    (<any>window).packetsPerSecond = () => {
      const durationSeconds = (Date.now() - this.start) / 1000;
      console.log('Packets per second: ', Math.floor(this.totalPacketsHandled * 10 / durationSeconds) / 10);
    };
    this.on('toggle-machina:value', (event, value) => {
      this.machinaToggle$.next(value);
    });
    this.send('toggle-machina:get');
    this.on('packet', (event, message: Message) => {
      this.handleMessage(message);
    });
    this.on('navigate', (event, url: string) => {
      if (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
      console.log('NAVIGATE', url);
      this.router.navigate(url.split('/'));
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
              this.send('toggle-machina', false);
              this.machinaToggle$.next(false);
              break;
          }
        });
    });
    this.on('rawsock-needs-admin', () => {
      this.translate.get('PACKET_CAPTURE.Rawsock_needs_admin')
        .pipe(
          first(),
          switchMap(title => {
            return this.dialog.create({
              nzFooter: null,
              nzTitle: title,
              nzContent: RawsockAdminErrorPopupComponent
            }).afterClose;
          })
        )
        .subscribe(res => {
          switch (res) {
            case 'winpcap':
              this.send('rawsock', false);
              break;
            case 'disable':
              this.send('toggle-machina', false);
              this.machinaToggle$.next(false);
              break;
          }
        });
    });
    // If we don't get a packet for an entire minute, something is wrong.
    this.packets$.pipe(
      debounceTime(60000)
    ).subscribe(() => {
      this.send('log', {
        level: 'error',
        data: 'No ping received from the server during 60 seconds'
      });
    });
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
          debounce(() => interval(250)),
          distinctUntilChanged()
        )
        .subscribe(state => {
          this.send('app-state:set', JSON.parse(JSON.stringify(state)));
        });
    }
  }

  private handleMessage(packet: Message): void {
    // If we're inside an overlay, don't do anything with the packet, we don't care.
    if (!this.overlayUri) {
      this.totalPacketsHandled++;
      this.packets$.next(packet);
      const debugPackets = (<any>window).debugPackets;
      if (debugPackets === true || (typeof debugPackets === 'function' && debugPackets(packet))) {
        // tslint:disable-next-line:no-console
        console.info(packet.type, packet);
      }
    }
  }

  public log(...args: any[]): void {
    this.send('log', args);
  }
}
