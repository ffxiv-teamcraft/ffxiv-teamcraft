import { Injectable, NgZone } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { Router } from '@angular/router';
import { Vector2 } from '../tools/vector2';
import { interval, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { bufferCount, debounce, debounceTime, distinctUntilChanged, first, map, shareReplay } from 'rxjs/operators';
import { ofPacketType } from '../rxjs/of-packet-type';
import { Store } from '@ngrx/store';
import * as pcap from '../../model/pcap';
import { PlayerSpawn } from '../../model/pcap';
import { environment } from '../../../environments/environment';

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

  public get itemInfoPackets$(): Observable<pcap.ItemInfo> {
    return this.packets$.pipe(ofPacketType('itemInfo'));
  }

  public get updateInventorySlotPackets$(): Observable<pcap.UpdateInventorySlot> {
    return this.packets$.pipe(ofPacketType('updateInventorySlot'));
  }

  public get inventoryTransactionPackets$(): Observable<pcap.InventoryTransaction> {
    return this.packets$.pipe(ofPacketType('inventoryTransaction'));
  }

  public get cid$(): Observable<pcap.PlayerSetup> {
    return this.packets$.pipe(ofPacketType('playerSetup'));
  }

  public get worldId$(): Observable<number> {
    return this.packets$.pipe(ofPacketType<PlayerSpawn>('playerSpawn'), map(packet => packet.currentWorldId));
  }

  public get marketTaxRatePackets$(): Observable<pcap.MarketTaxRates> {
    return this.packets$.pipe(ofPacketType('marketTaxRates'));
  }

  public get marketBoardSearchResult$(): Observable<pcap.MarketBoardSearchResult> {
    return this.packets$.pipe(ofPacketType('marketBoardSearchResult'));
  }

  public get marketboardListingCount$(): Observable<pcap.MarketBoardItemListingCount> {
    return this.packets$.pipe(ofPacketType('marketBoardItemListingCount'));
  }

  public get marketboardListing$(): Observable<pcap.MarketBoardItemListing> {
    return this.packets$.pipe(ofPacketType('marketBoardItemListing'));
  }

  public get marketboardListingHistory$(): Observable<pcap.MarketBoardItemListingHistory> {
    return this.packets$.pipe(ofPacketType('marketBoardItemListingHistory'));
  }

  public get inventoryModifyHandlerPackets$(): Observable<pcap.InventoryModifyHandler> {
    return this.packets$.pipe(ofPacketType('inventoryModifyHandler'));
  }

  public get npcSpawnPackets$(): Observable<pcap.NpcSpawn> {
    return this.packets$.pipe(ofPacketType('npcSpawn'));
  }

  public get objectSpawnPackets$(): Observable<pcap.ObjectSpawn> {
    return this.packets$.pipe(ofPacketType('objectSpawn'));
  }

  public get retainerInformationPackets$(): Observable<pcap.RetainerInformation> {
    return this.packets$.pipe(ofPacketType('retainerInformation'));
  }

  public get updatePositionHandlerPackets$(): Observable<pcap.UpdatePositionHandler> {
    return this.packets$.pipe(ofPacketType('updatePositionHandler'));
  }

  public get updatePositionInstancePackets$(): Observable<pcap.UpdatePositionInstance> {
    return this.packets$.pipe(ofPacketType('updatePositionInstance'));
  }

  public get initZonePackets$(): Observable<pcap.InitZone> {
    return this.packets$.pipe(ofPacketType('initZone'));
  }

  public get playerStatsPackets$(): Observable<pcap.PlayerStats> {
    return this.packets$.pipe(ofPacketType('playerStats'));
  }

  public get updateClassInfoPackets$(): Observable<pcap.UpdateClassInfo> {
    return this.packets$.pipe(ofPacketType('updateClassInfo'));
  }

  public get currencyCrystalInfoPackets$(): Observable<pcap.CurrencyCrystalInfo> {
    return this.packets$.pipe(ofPacketType('currencyCrystalInfo'));
  }

  public get prepareZoningPackets$(): Observable<pcap.PrepareZoning> {
    return this.packets$.pipe(ofPacketType('prepareZoning'));
  }

  public get eventPlay4Packets$(): Observable<pcap.EventPlay4> {
    return this.packets$.pipe(ofPacketType('eventPlay4'));
  }

  public get eventPlay32Packets$(): Observable<pcap.EventPlay32> {
    return this.packets$.pipe(ofPacketType('eventPlay32'));
  }

  public packets$: Subject<pcap.BasePacket> = new Subject<pcap.BasePacket>();

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
      if (!environment.production) {
        try {
          this.canBeCloned(data);
        } catch (e) {
          console.error(`[DEV MODE ONLY] IPC Message sent on ${channel} will not work with Electron > 8`);
          console.error(data);
        }
      }
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
    this.on('packet', (event, packet: pcap.BasePacket) => {
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

  private canBeCloned(val: any): boolean {
    if (Object(val) !== val) // Primitive value
      return true;
    switch ({}.toString.call(val).slice(8, -1)) { // Class
      case 'Boolean':
      case 'Number':
      case 'String':
      case 'Date':
      case 'RegExp':
      case 'Blob':
      case 'FileList':
      case 'ImageData':
      case 'ImageBitmap':
      case 'ArrayBuffer':
        return true;
      case 'Array':
      case 'Object':
        return Object.keys(val).every(prop => this.canBeCloned(val[prop]));
      case 'Map':
        return [...val.keys()].every(this.canBeCloned)
          && [...val.values()].every(this.canBeCloned);
      case 'Set':
        return [...val.keys()].every(this.canBeCloned);
      default:
        throw new Error(`${JSON.stringify(val)} cannot be cloned`);
    }
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

  private handlePacket(packet: pcap.BasePacket): void {
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
