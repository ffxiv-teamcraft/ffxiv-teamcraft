import { Store } from '../store';
import { BrowserWindow } from 'electron';

export class ProxyManager {

  constructor(private store: Store) {
  }

  setProxy(win: BrowserWindow, params: { rule?: string, pac?: string, bypass?: string }) {
    const ses = win.webContents.session;
    ses.setProxy({
      proxyRules: params.rule || this.store.get('proxy-rule', ''),
      proxyBypassRules: params.bypass || this.store.get('proxy-bypass', ''),
      pacScript: params.pac || this.store.get('proxy-pac', '')
    });
  }
}
