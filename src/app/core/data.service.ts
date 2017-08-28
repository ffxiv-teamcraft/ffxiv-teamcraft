import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AngularFireDatabase} from 'angularfire2/database';
import {TranslateService} from '@ngx-translate/core';
import {GarlandToolsService} from './garland-tools.service';

@Injectable()
export class DataService {

    private static FC_CRAFT_IDS = [
        9462,
        9463,
        9464,
        9465,
        9466,
        9653,
        9654,
        9655,
        9656,
        9657,
        9658,
        12215,
        9659,
        9660,
        9661,
        9662,
        9663,
        9664,
        9665,
        9666,
        9667,
        9668,
        9669,
        9670,
        9671,
        9672,
        9673,
        9674,
        12216,
        9676,
        9677,
        9678,
        9679,
        9680,
        9681,
        9682,
        9684,
        10156,
        10157,
        10158,
        10159,
        10160,
        10161,
        10162,
        10163,
        10164,
        10165,
        10166,
        10167,
        10168,
        10169,
        10170,
        10171,
        10172,
        10173,
        10174,
        10175,
        10176,
        10177,
        10178,
        10179,
        14003,
        14004,
        14005,
        14006,
        10361,
        10362,
        10363,
        10364,
        10365,
        10366,
        10367,
        10368,
        10369,
        10370,
        10371,
        10372,
        13092,
        13093,
        13094,
        15950,
        15951,
        15952,
        17004,
        17005,
        17006,
        19767,
        19768,
        19769,
    ];

    private xivdbUrl = 'https://api.xivdb.com';
    private garlandUrl = 'https://www.garlandtools.org/db/data';

    constructor(private http: HttpClient, private af: AngularFireDatabase, private i18n: TranslateService,
                private gt: GarlandToolsService) {
    }

    public getItem(id: number): Observable<any> {
        return this.getGarland(`/item/${id}`);
    }

    public getNpc(id: number): any {
        return this.getGarland(`/npc/${id}`);
    }

    public searchRecipe(query: string): Observable<any> {
        return this.getXivdb(`/search?string=${query}&one=items&language=${this.i18n.currentLang}`)
            .map(results => {
                return results.items.results.filter(i => {
                    return this.gt.getItem(i.id).f === 1;
                });
            });
    }

    private getXivdb(uri: string): Observable<any> {
        return this.http.get<any>(this.xivdbUrl + uri);
    }

    private getGarland(uri: string): Observable<any> {
        return this.http.get<any>(this.garlandUrl + uri + '.json');
    }

    private getFirebaseCache(uri: string): Observable<any> {
        return this.af.object(`/xivdb${uri}`);
    }
}
