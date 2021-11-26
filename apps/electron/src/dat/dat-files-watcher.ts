import * as log from 'electron-log';
import { FSWatcher, readdirSync, readFile, readFileSync, statSync, watch } from 'fs';
import { join } from 'path';
import { MainWindow } from '../window/main-window';
import * as BufferReader from 'buffer-reader';
import { InventoryCoords } from './inventory-coords';
import { RetainerInventory } from './retainer-inventory';
import { app, dialog, ipcMain, OpenDialogOptions } from 'electron';
import { Store } from '../store';
import * as hashFiles from 'hash-files';

class UnexpectedSizeError extends Error {
  constructor(expected, real) {
    super(`Incorrect Size - Expected ${expected} but got ${real}`);
  }
}

class UnexpectedIdentifierError extends Error {
  constructor(expected, real) {
    super(`Unexpected Identifier - Expected 0x${expected.toString(16).padStart(2, '0')} but got 0x${real.toString(16).padStart(2, '0')}`);
  }
}

export class DatFilesWatcher {

  private static readonly CONTENT_ID_REGEXP = /FFXIV_CHR(\w+)/;

  private static readonly XOR8 = 0x73;
  private static readonly XOR16 = 0x7373;
  private static readonly XOR32 = 0x73737373;

  private static readonly INVENTORY_NAMES = [
    'Player',
    'ArmoryMain',
    'ArmoryHead',
    'ArmoryBody',
    'ArmoryHand',
    'ArmoryWaist',
    'ArmoryLegs',
    'ArmoryFeet',
    'ArmoryOff',
    'ArmoryEar',
    'ArmoryNeck',
    'ArmoryWrist',
    'ArmoryRing',
    'ArmorySoulCrystal',
    'SaddleBag',
    'PremiumSaddlebag'
  ];

  private watcher: FSWatcher;

  private hashRegistry: Record<string, string> = {};

  private lastChanges: { file: string, timestamp: number }[] = [];

  constructor(private mainWindow: MainWindow, private store: Store) {
    mainWindow.closed$.subscribe(() => {
      this.stop();
    });

    ipcMain.on('dat:path:get', (event) => {
      event.sender.send('dat:path:value', this.getWatchDir());
    });

    ipcMain.on('dat:path:set', (event, value) => {
      const folderPickerOptions: OpenDialogOptions = {
        // See place holder 2 in above image
        defaultPath: this.getWatchDir(),
        properties: ['openDirectory']
      };
      dialog.showOpenDialog(this.mainWindow.win, folderPickerOptions).then((result) => {
        if (result.canceled) {
          return;
        }
        const filePath = result.filePaths[0];
        this.store.set('dat-watcher:dir', filePath);
        event.sender.send('dat:path:value', this.getWatchDir());
        this.stop();
        this.start();
      });
    });
  }

  private onEvent(event: string, filename: string, watchDir: string): void {
    if (event === 'change' && filename?.includes('FFXIV_CHR')) {
      const contentId = DatFilesWatcher.CONTENT_ID_REGEXP.exec(filename)[1];
      if (this.mainWindow.win) {
        if (filename.endsWith('ITEMODR.DAT')) {
          this.parseItemODR(join(watchDir, filename), contentId);
        }
        if (this.shouldTriggerContentIdChange(watchDir, filename)) {
          log.log(`Content ID: ${contentId}`);
          this.mainWindow.win.webContents.send('dat:content-id', contentId);
        }
      }
    }
  }

  private shouldTriggerContentIdChange(watchDir: string, filename: string): boolean {
    if (!filename.endsWith('ITEMODR.DAT')) {
      return false;
    }
    const fullFilePath = join(watchDir, filename);
    try {
      const newHash = hashFiles.sync({ files: [fullFilePath] });
      if (this.hashRegistry[fullFilePath] !== newHash) {
        log.log(`Approved hash for ${filename}`);
        this.hashRegistry[fullFilePath] = newHash;
        this.lastChanges = [];
        return true;
      }
      this.lastChanges = [
        ...this.lastChanges.filter(c => Date.now() - c.timestamp < 10000),
        { timestamp: Date.now(), file: filename }
      ];
      return false;
    } catch (e) {
      return false;
    }
  }

  private parseItemODR(filePath: string, contentId): void {
    readFile(filePath, (err, content) => {
      const odr = this.parseItemOrder(content);
      if (this.mainWindow.win) {
        this.mainWindow.win.webContents.send('dat:item-odr', { contentId, odr });
      }
    });
  }

  private getAllItemODRs(baseDir: string): Record<string, Record<string, InventoryCoords[] | RetainerInventory[]>> {
    const dirs = readdirSync(baseDir);
    return dirs.reduce((acc, dir) => {
      const match = DatFilesWatcher.CONTENT_ID_REGEXP.exec(dir);
      const contentId = match && match[1];
      const stats = statSync(join(baseDir, dir));
      if (stats.isDirectory() && contentId) {
        try {
          const odr = readFileSync(join(baseDir, dir, 'ITEMODR.DAT'));
          return {
            ...acc,
            [contentId]: this.parseItemOrder(odr)
          };
        } catch (e) {
          log.error(e);
          return acc;
        }
      }
      return acc;
    }, {});
  }

  private getWatchDir(): string {
    const region = this.store.get('region', null);
    const customDir = this.store.get('dat-watcher:dir', null);
    if (customDir) {
      return customDir;
    }
    switch (region) {
      case 'KR':
        return `${app.getPath('documents')}\\My Games\\FINAL FANTASY XIV - KOREA`;
      case 'CN':
        return 'C:\\Program Files (x86)\\上海数龙科技有限公司\\最终幻想XIV\\game\\My Games\\FINAL FANTASY XIV - A Realm Reborn';
      default:
        return `${app.getPath('documents')}\\My Games\\FINAL FANTASY XIV - A Realm Reborn`;
    }
  }

  start(): void {
    this.mainWindow.closed$.subscribe(() => {
      this.stop();
    });
    if (!!this.watcher) {
      return;
    }
    const watchDir = this.getWatchDir();
    try {
      // Prepare hash cache
      const dirs = readdirSync(watchDir);
      this.hashRegistry = dirs.reduce((acc, dir) => {
        const match = DatFilesWatcher.CONTENT_ID_REGEXP.exec(dir);
        const contentId = match && match[1];
        const stats = statSync(join(watchDir, dir));
        if (stats.isDirectory() && contentId) {
          try {
            const odrPath = join(watchDir, dir, 'ITEMODR.DAT');
            const gsPath = join(watchDir, dir, 'GS.DAT');
            const odrHash = hashFiles.sync({ files: [odrPath] });
            const gsHash = hashFiles.sync({ files: [gsPath] });
            return {
              ...acc,
              [odrPath]: odrHash,
              [gsPath]: gsHash
            };
          } catch (e) {
            log.error(e);
            return acc;
          }
        }
        return acc;
      }, {});

      this.watcher = watch(watchDir, { recursive: true }, (event, filename) => {
        this.onEvent(event, filename, watchDir);
      });
      ipcMain.on('dat:all-odr', event => {
        event.sender.send('dat:all-odr:value', this.getAllItemODRs(watchDir));
      });
      log.log(`DAT Watcher started on ${watchDir}`);
    } catch (e) {
      log.error(e);
    }
  }

  stop(): void {
    if (!this.watcher) {
      return;
    }
    this.watcher.close();
    delete this.watcher;
  }

  private readSlot(reader: BufferReader): InventoryCoords {
    const s = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
    if (s !== 4) throw new UnexpectedSizeError(4, s);
    return { slot: reader.nextUInt16LE() ^ DatFilesWatcher.XOR16, container: reader.nextUInt16LE() ^ DatFilesWatcher.XOR16 };
  }

  private readInventory(reader: BufferReader): InventoryCoords[] {
    const s = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
    if (s !== 4) throw new UnexpectedSizeError(4, s);
    const slotCount = reader.nextUInt32LE() ^ DatFilesWatcher.XOR32;

    const inventory = [];
    for (let i = 0; i < slotCount; i++) {
      const x = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
      if (x !== 0x69) throw new UnexpectedIdentifierError(0x69, x);
      const slot = this.readSlot(reader);
      inventory.push(slot);
    }
    return inventory;
  }

  private readRetainers(reader: BufferReader): RetainerInventory[] {
    const s = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
    if (s !== 4) throw new UnexpectedSizeError(4, s);
    const retainerCount = reader.nextUInt32LE() ^ DatFilesWatcher.XOR32;
    const retainers = [];
    for (let i = 0; i < retainerCount; i++) {
      const x = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
      if (x !== 0x52) throw new UnexpectedIdentifierError(0x52, x);
      const retainer = this.readRetainer(reader);
      retainers.push(retainer);
    }
    return retainers;
  }

  private readRetainer(reader: BufferReader): RetainerInventory {
    const s = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
    if (s !== 8) throw new UnexpectedSizeError(8, s);

    const retainer: Partial<RetainerInventory> = {
      id: reader.nextBuffer(8).map(b => b ^ DatFilesWatcher.XOR8).reverse().toString('hex')
    };

    const x = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
    if (x !== 0x6E) throw new UnexpectedIdentifierError(0x6E, x);
    retainer.inventory = this.readInventory(reader);
    return retainer as RetainerInventory;
  }

  private parseItemOrder(fileBuffer: Buffer): Record<string, InventoryCoords[] | RetainerInventory[]> {
    const data: Record<string, InventoryCoords[] | RetainerInventory[]> = {};
    try {
      const reader = new BufferReader(fileBuffer);

      const fileHeader = reader.nextBuffer(16);

      reader.move(1); // Unknown Byte, Appears to be the main inventory size, but that is
      let inventoryIndex = 0;
      while (true) {

        const identifier = reader.nextUInt8() ^ DatFilesWatcher.XOR8;
        switch (identifier) {
          case 0x56: {
            // Unknown
            reader.move(reader.nextUInt8() ^ DatFilesWatcher.XOR8);
            break;
          }
          case 0x6E: {
            // Start of an inventory
            const inventory = this.readInventory(reader);

            const inventoryName = DatFilesWatcher.INVENTORY_NAMES[inventoryIndex++];
            data[inventoryName] = inventory;

            break;
          }

          case 0x4E: {
            data.Retainers = this.readRetainers(reader);
            break;
          }

          case 0x73: {
            return data;
          }
          default: {
            throw new Error('Unexpected Identifier: ' + identifier);
          }

        }
      }
    } catch (err) {
      log.error(err);
    }
    return data;
  };

}
