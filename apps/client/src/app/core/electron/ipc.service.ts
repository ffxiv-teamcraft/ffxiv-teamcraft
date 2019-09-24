import { Injectable } from '@angular/core';
import { PlatformService } from '../tools/platform.service';
import { IpcRenderer } from 'electron';
import { Router } from '@angular/router';
import { Vector2 } from '../tools/vector2';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class IpcService {

  public static readonly ROTATION_DEFAULT_DIMENSIONS = { x: 600, y: 200 };

  private readonly _ipc: IpcRenderer | undefined = undefined;

  private _itemInfoPackets$: Subject<any> = new Subject<any>();

  public get itemInfoPackets$(): Observable<any> {
    return this._itemInfoPackets$.asObservable();
  }

  private _updateInventorySlotPackets$: Subject<any> = new Subject<any>();

  public get updateInventorySlotPackets$(): Observable<any> {
    return this._updateInventorySlotPackets$.asObservable();
  }

  private _cid$: Subject<any> = new Subject<any>();

  public get cid$(): Observable<any> {
    return this._cid$.asObservable();
  }

  private _worldId$: Subject<any> = new Subject<any>();

  public get worldId$(): Observable<any> {
    return this._worldId$.asObservable();
  }

  private _marketboardListing$: Subject<any> = new Subject<any>();

  public get marketboardListing$(): Observable<any> {
    return this._marketboardListing$.asObservable();
  }

  private _marketboardListingHistory$: Subject<any> = new Subject<any>();

  public get marketboardListingHistory$(): Observable<any> {
    return this._marketboardListingHistory$.asObservable();
  }

  private _inventoryModifyHandlerPackets$: Subject<any> = new Subject<any>();

  public get inventoryModifyHandlerPackets$(): Observable<any> {
    return this._inventoryModifyHandlerPackets$.asObservable();
  }

  private _npcSpawnPackets$: Subject<any> = new Subject<any>();

  public get npcSpawnPackets$(): Observable<any> {
    return this._npcSpawnPackets$.asObservable();
  }

  private _containerInfoPackets$: Subject<any> = new Subject<any>();

  public get containerInfoPackets$(): Observable<any> {
    return this._containerInfoPackets$.asObservable();
  }

  constructor(private platformService: PlatformService, private router: Router) {
    // Only load ipc if we're running inside electron
    if (platformService.isDesktop()) {
      if (window.require) {
        try {
          this._ipc = window.require('electron').ipcRenderer;
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
  }

  public on(channel: string, cb: Function): void {
    if (this._ipc !== undefined) {
      this._ipc.on(channel, cb);
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
    this.on('packet', (event, packet: any) => {
      this.handlePacket(packet);
    });
    this.on('navigate', (event, url: string) => {
      if (url.endsWith('/')) {
        url = url.substr(0, url.length - 1);
      }
      this.router.navigate(url.split('/'));
    });
  }

  private handlePacket(packet: any): void {
    switch (packet.type) {
      case 'itemInfo':
        this._itemInfoPackets$.next(packet);
        break;
      case 'updateInventorySlot':
        this._updateInventorySlotPackets$.next(packet);
        break;
      case 'inventoryModifyHandler':
        this._inventoryModifyHandlerPackets$.next(packet);
        break;
      case 'marketBoardItemListing':
        this._marketboardListing$.next(packet);
        break;
      case 'marketBoardItemListingHistory':
        this._marketboardListingHistory$.next(packet);
        break;
      case 'playerSetup':
        this._cid$.next(packet);
        break;
      case 'playerSpawn':
        this._worldId$.next(packet.currentWorldId);
        break;
      case 'npcSpawn':
        this._npcSpawnPackets$.next(packet);
        break;
      case 'containerInfo':
        this._containerInfoPackets$.next(packet);
        break;
      default:
        console.log(packet);
        break;
    }
  }
}
