import { IpcRendererEvent } from 'electron';

const { contextBridge, ipcRenderer } = require('electron');

const allowedChannels = [
  'toggle-machina',
  'toggle-machina:value',
  'packet',
  'machina:error',
  'machina:error:raw',
  'navigate',
  'fishing-state',
  'install-npcap-prompt',
  'update-downloaded',
  'rawsock-needs-admin',
  'app-state',
  'displayed',
  'apply-language',
  'mappy:reload',
  'dat:content-id',
  'dat:item-odr',
  'inventory:overlay:set',
  'metrics:loaded',
  'update-settings',
  'metrics:path:value',
  'dat:path:value',
  'rawsock:value',
  'mappy-state',
  'machina:firewall:rule-set',
  'lodestone:character:search',
  'oauth-reply',
  'free-company-workshops:value',
  'dat:all-odr:value',
  'inventory:value',
  'always-on-top:value',
  'disable-initial-navigation',
  'start-minimized:value',
  'always-quit:value',
  'enable-minimize-reduction-button:value',
  'no-shortcut:value',
  'proxy-rule:value',
  'proxy-bypass:value',
  'proxy-pac:value',
  'overlay:get-opacity',
  'navigated',
  'app-ready',
  'toggle-machina',
  'machina:firewall:set-rule',
  'update:check',
  'open-link',
  'language',
  'zoom-in',
  'zoom-out',
  'notification',
  'analytics:init',
  'analytics:pageView',
  'lodestone:searchCharacter',
  'fishing-report',
  'fishing-state:set',
  'overlay',
  'log',
  'toggle-machina:get',
  'install-npcap',
  'install-update',
  'rawsock',
  'app-state:get',
  'app-state:set',
  'mappy-state:set',
  'oauth',
  'free-company-workshops:get',
  'free-company-workshops:set',
  'inventory:set',
  'inventory:get',
  'dat:all-odr',
  'overlay:open-page',
  'overlay:set-opacity',
  'overlay:set-on-top',
  'overlay:get-on-top',
  'metrics:load',
  'metrics:persist',
  'apply-settings',
  'always-on-top:get',
  'disable-initial-navigation:get',
  'no-shortcut:get',
  'start-minimized:get',
  'always-quit:get',
  'enable-minimize-reduction-button:get',
  'proxy-rule:get',
  'proxy-bypass:get',
  'proxy-pac:get',
  'metrics:path:get',
  'dat:path:get',
  'rawsock:get',
  'metrics:path:set',
  'dat:path:set',
  'proxy-rule',
  'proxy-pac',
  'always-on-top',
  'no-shortcut',
  'start-minimized',
  'always-quit',
  'enable-minimize-reduction-button',
  'show-devtools',
  'clear-cache',
  'fishing-state:get',
  'mappy-state:get',
  'hardware-acceleration:get',
  'hardware-acceleration:value'
];

function checkChannel(channel: string): boolean {
  const isAllowed =
    channel.startsWith('overlay:')
    || allowedChannels.includes(channel);
  if (!isAllowed) {
    console.error(`[IPC] Tried to use unallowed channel ${channel}`);
    ipcRenderer.send('log', `[IPC] Tried to use unallowed channel ${channel}`);
  }
  return isAllowed;
}

contextBridge.exposeInMainWorld('ipc', {
  init: () => {
    ipcRenderer.setMaxListeners(0);
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
  send: (channel: string, ...data: any[]) => {
    if (checkChannel(channel)) {
      ipcRenderer.send(channel, ...data);
    }
  },
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
    if (checkChannel(channel)) {
      ipcRenderer.on(channel, listener);
    }
  },
  once: (channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) => {
    if (checkChannel(channel)) {
      ipcRenderer.once(channel, listener);
    }
  }
});
