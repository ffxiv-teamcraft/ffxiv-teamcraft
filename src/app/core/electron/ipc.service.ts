import {Injectable} from '@angular/core';
import {PlatformService} from '../tools/platform.service';
import {IpcRenderer} from 'electron';
import {Router} from '@angular/router';

@Injectable()
export class IpcService {


    private readonly _ipc: IpcRenderer | undefined = undefined;

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

    private connectListeners(): void {
        this.on('navigate', (url) => {
            this.router.navigateByUrl(url);
        });
    }

    public on(channel: string, cb: Function): void {
        if (this._ipc !== undefined) {
            this._ipc.on(channel, cb);
        }
    }

    public send(channel: string, ...args: any[]): void {
        if (this._ipc !== undefined) {
            return this._ipc.send(channel, ...args);
        }
    }
}
