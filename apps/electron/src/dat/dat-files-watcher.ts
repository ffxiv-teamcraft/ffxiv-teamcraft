import { exec } from 'child_process';
import * as log from 'electron-log';
import { FSWatcher, readdirSync, readFile, readFileSync, statSync, watch } from 'fs';
import { join } from 'path';
import { MainWindow } from '../window/main-window';
import * as BufferReader from 'buffer-reader';
import { InventoryCoords } from './inventory-coords';
import { RetainerInventory } from './retainer-inventory';
import { app, ipcMain } from 'electron';

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

  private lastContentId: string;

  private watcher: FSWatcher;

  constructor(private mainWindow: MainWindow) {
  }

  private onEvent(event: string, filename: string, watchDir: string): void {
    if (event === 'change' && filename.indexOf('FFXIV_CHR') > -1) {
      const contentId = DatFilesWatcher.CONTENT_ID_REGEXP.exec(filename)[1];
      if (this.mainWindow.win) {
        if (filename.endsWith('ITEMODR.DAT')) {
          this.parseItemODR(join(watchDir, filename), contentId);
        }
        this.mainWindow.win.webContents.send('dat:content-id', contentId);
        if (contentId !== this.lastContentId) {
          log.log(`New content ID: ${contentId}`);
          this.lastContentId = contentId;
        }
      }
    }
  }

  private parseItemODR(filePath: string, contentId): void {
    readFile(filePath, (err, content) => {
      const odr = this.parseItemOrder(content);
      this.mainWindow.win.webContents.send('dat:item-odr', { contentId, odr });
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

  start(): void {
    this.mainWindow.closed$.subscribe(() => {
      this.stop();
    });
    if (!!this.watcher) {
      return;
    }
    log.log('Documents', app.getPath('documents'));
    exec('Get-ItemProperty -Path Registry::HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\"User Shell Folders" -Name Personal', { 'shell': 'powershell.exe' }, (err, output) => {
      if (output) {
        const documentsDir = /Personal\s+:\s?(.*)/.exec(output.trim())[1];
        const watchDir = `${documentsDir}\\My Games\\FINAL FANTASY XIV - A Realm Reborn`;
        this.watcher = watch(watchDir, { recursive: true }, (event, filename) => {
          this.onEvent(event, filename, watchDir);
        });
        ipcMain.on('dat:all-odr', event => {
          event.sender.send('dat:all-odr:value', this.getAllItemODRs(watchDir));
        });
        log.log(`DAT Watcher started on ${watchDir}`);
      } else {
        log.error('No output from reg read command, DAT Watcher cannot start.');
        log.error(`Error: ${err}`);
      }
    });
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
