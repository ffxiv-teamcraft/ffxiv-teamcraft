import { LazyDataService } from '../app/core/data/lazy-data.service';
import { combineLatest, Observable, of } from 'rxjs';
import { lazyFilesList } from '../app/core/data/lazy-files-list';
import { map } from 'rxjs/operators';
import { LazyData } from '../app/core/data/lazy-data';
import { patchList } from './patchlist';

export class LazyDataTestService extends LazyDataService {

  constructor() {
    super(null, null, null, null);
  }

  load(): void {
    const extracts = require('../assets/extracts.json');
    this.extracts = extracts;
    this.extracts$.next(extracts);
    this.datacenters = {
      'Aether': ['Adamantoise', 'Cactuar', 'Faerie', 'Gilgamesh', 'Jenova', 'Midgardsormr', 'Sargatanas', 'Siren'],
      'Chaos': ['Cerberus', 'Louisoix', 'Moogle', 'Omega', 'Ragnarok', 'Spriggan'],
      'Crystal': ['Balmung', 'Brynhildr', 'Coeurl', 'Diabolos', 'Goblin', 'Malboro', 'Mateus', 'Zalera'],
      'Elemental': ['Aegis', 'Atomos', 'Carbuncle', 'Garuda', 'Gungnir', 'Kujata', 'Ramuh', 'Tonberry', 'Typhon', 'Unicorn'],
      'Gaia': ['Alexander', 'Bahamut', 'Durandal', 'Fenrir', 'Ifrit', 'Ridill', 'Tiamat', 'Ultima', 'Valefor', 'Yojimbo', 'Zeromus'],
      'Light': ['Lich', 'Odin', 'Phoenix', 'Shiva', 'Zodiark', 'Twintania'],
      'Mana': ['Anima', 'Asura', 'Belias', 'Chocobo', 'Hades', 'Ixion', 'Mandragora', 'Masamune', 'Pandaemonium', 'Shinryu', 'Titan'],
      'Primal': ['Behemoth', 'Excalibur', 'Exodus', 'Famfrit', 'Hyperion', 'Lamia', 'Leviathan', 'Ultros']
    };
    this.patches = patchList;
    combineLatest(lazyFilesList.map(row => {
      return this.loadFile(row.fileName).pipe(
        map(data => {
          return {
            ...row,
            data: data
          };
        })
      );
    })).subscribe((results) => {
      const lazyData: Partial<LazyData> = {};
      results.forEach(row => {
        lazyData[row.propertyName] = row.data;
      });
      this.data = lazyData as LazyData;
      this.data$.next(this.data);
      this.loaded$.next(true);
    });
  }

  private loadFile(filename: string): Observable<any> {
    if (filename.startsWith('/')) {
      filename = filename.substring(1);
    }
    return of(require(`../assets/data/${filename}`));
  }

}
