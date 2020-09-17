import { Injectable, NgZone } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { Router } from '@angular/router';
import { Vector2 } from '../tools/vector2';
import { interval, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { bufferCount, debounce, debounceTime, distinctUntilChanged, first, map, shareReplay } from 'rxjs/operators';
import { ofPacketType } from '../rxjs/of-packet-type';
import { Store } from '@ngrx/store';
import { BasePacket } from '../../model/pcap/BasePacket';

type EventCallback = (event: IpcRendererEvent, ...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  public static readonly ROTATION_DEFAULT_DIMENSIONS = { x: 600, y: 200 };

  private readonly _ipc: IpcRenderer | undefined = undefined;

  public get ready(): boolean {
    return this._ipc !== undefined;
  }

  public get itemInfoPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('itemInfo'));
  }

  public get updateInventorySlotPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('updateInventorySlot'));
  }

  public get inventoryTransactionPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('inventoryTransaction'));
  }

  public get cid$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('playerSetup'));
  }

  public get worldId$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('playerSpawn'), map(packet => packet.currentWorldId));
  }

  public get marketTaxRatePackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('marketTaxRates'));
  }

  public get marketBoardSearchResult$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('marketBoardSearchResult'));
  }

  public get marketboardListingCount$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('marketBoardItemListingCount'));
  }

  public get marketboardListing$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('marketBoardItemListing'));
  }

  public get marketboardListingHistory$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('marketBoardItemListingHistory'));
  }

  public get inventoryModifyHandlerPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('inventoryModifyHandler'));
  }

  public get npcSpawnPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('npcSpawn'));
  }

  public get objectSpawnPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('objectSpawn'));
  }

  public get retainerInformationPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('retainerInformation'));
  }

  public get updatePositionHandlerPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('updatePositionHandler'));
  }

  public get updatePositionInstancePackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('updatePositionInstance'));
  }

  public get initZonePackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('initZone'));
  }

  public get playerStatsPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('playerStats'));
  }

  public get updateClassInfoPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('updateClassInfo'));
  }

  public get currencyCrystalInfoPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('currencyCrystalInfo'));
  }

  public get actorControlPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('actorControl'));
  }

  public get prepareZoningPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('prepareZoning'));
  }

  public get eventPlay4Packets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('eventPlay4'));
  }

  public get eventPlay32Packets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('eventPlay32'));
  }

  public packets$: Subject<any> = new Subject<any>();

  public machinaToggle: boolean;

  public fishingState$: ReplaySubject<any> = new ReplaySubject<any>();

  public mainWindowState$: ReplaySubject<any> = new ReplaySubject<any>();

  private stateSubscription: Subscription;

  public possibleMissingFirewallRule$ = this.packets$.pipe(
    bufferCount(100),
    first(),
    map(packets => {
      return packets.every(packet => packet.operation === 'send');
    }),
    shareReplay(1)
  );

  constructor(private platformService: PlatformService, private router: Router,
              private store: Store<any>, private zone: NgZone) {
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
    this.send('app-ready', true);
    this.on('toggle-machina:value', (event, value) => {
      this.machinaToggle = value;
    });
    this.send('toggle-machina:get');
    this.on('packet', (event, packet: BasePacket) => {
      this.handlePacket(packet);
    });
    this.on('navigate', (event, url: string) => {
      if (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
      console.log('NAVIGATE', url);
      this.router.navigate(url.split('/'));
    });
    this.on('fishing-state', (event, data) => this.fishingState$.next(data));
    // If we don't get a ping for an entire minute, something is wrong.
    this.packets$.pipe(
      ofPacketType('ping'),
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
          this.send('app-state:set', state);
        });
    }
  }

  private handlePacket(packet: BasePacket): void {
    // If we're inside an overlay, don't do anything with the packet, we don't care.
    if (!this.overlayUri) {
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
