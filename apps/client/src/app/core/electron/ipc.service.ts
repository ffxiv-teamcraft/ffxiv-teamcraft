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
      console.log('packet', packet.type, packet);
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
      default:
        break;
    }
  }
}
