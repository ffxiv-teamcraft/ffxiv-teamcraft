import { Injectable } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { Router } from '@angular/router';
import { Vector2 } from '../tools/vector2';
import { Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { ofPacketType } from '../rxjs/of-packet-type';
import { Store } from '@ngrx/store';

type EventCallback = (event: IpcRendererEvent, ...args: any[]) => void;

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  public static readonly ROTATION_DEFAULT_DIMENSIONS = { x: 600, y: 200 };

  private readonly _ipc: IpcRenderer | undefined = undefined;

  public get itemInfoPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('itemInfo'));
  }

  public get updateInventorySlotPackets$(): Observable<any> {
    return this.packets$.pipe(ofPacketType('updateInventorySlot'));
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

  public packets$: Subject<any> = new Subject<any>();

  public machinaToggle: boolean;

  public fishingState$: ReplaySubject<any> = new ReplaySubject<any>();

  public mainWindowState$: ReplaySubject<any> = new ReplaySubject<any>();

  private stateSubscription: Subscription;

  constructor(private platformService: PlatformService, private router: Router,
              private store: Store<any>) {
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
    this.handleOverlayChange();
  }

  public on(channel: string, cb: EventCallback): void {
    if (this._ipc !== undefined) {
      this._ipc.on(channel, cb);
    }
  }

  public once(channel: string, cb: EventCallback): void {
    if (this._ipc !== undefined) {
      this._ipc.once(channel, cb);
    }
  }

  public send(channel: string, data?: any): void {
    if (this._ipc !== undefined) {
      return this._ipc.send(channel, data);
    }
  }

  public openOverlay(url: string, registrationUri: string, defaultDimensions?: Vector2): void {
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
    this.on('packet', (event, packet: any) => {
      this.handlePacket(packet);
    });
    this.on('navigate', (event, url: string) => {
      if (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
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
      this.stateSubscription = this.store.subscribe(state => {
        this.send('app-state:set', state);
      });
    }
  }

  private handlePacket(packet: any): void {
    // If we're inside an overlay, don't do anything with the packet, we don't care.
    if (this._overlayUri === undefined) {
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
