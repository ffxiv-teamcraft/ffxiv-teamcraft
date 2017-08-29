import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { TranslateService } from '@ngx-translate/core';
import { GarlandToolsService } from './garland-tools.service';
import { Recipe } from '../model/recipe';
import { I18nName } from '../model/i18n-name';

@Injectable()
export class DataService {

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

    public searchRecipe(query: string): Observable<Recipe[]> {
        return this.getXivdb(`/search?string=${query}&one=items&language=${this.i18n.currentLang}`)
            .map(results => {
                return results.items.results.filter(i => {
                    return this.gt.getItem(i.id).f === 1;
                });
            }).mergeMap(results => {
                const recipes: Observable<any>[] = [];
                results.forEach(item => {
                    recipes.push(this.getItem(item.id));
                });
                return Observable.combineLatest(...recipes, (...details) => {
                    const res: Recipe[] = [];
                    for (const row of details) {
                        const item = row.item;
                        for (const craft of item.craft) {
                            const recipe: Recipe = {
                                recipeId: craft.id,
                                itemId: item.id,
                                job: craft.job,
                                stars: craft.stars,
                                name: {fr: item.fr.name, en: item.en.name, ja: item.ja.name, de: item.de.name},
                                lvl: craft.lvl,
                                icon: item.icon,
                                url_xivdb: this.getXivdbUrl(craft.id, 'recipe')
                            };
                            res.push(recipe);
                        }
                    }
                    return res;
                });
            });
    }

    private getXivdbUrl(id: number, type: string): I18nName {
        return {
            fr: `http://fr.xivdb.com/${type}/${id}`,
            en: `http://xivdb.com/${type}/${id}`,
            de: `http://de.xivdb.com/${type}/${id}`,
            ja: `http://ja.xivdb.com/${type}/${id}`
        };
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
