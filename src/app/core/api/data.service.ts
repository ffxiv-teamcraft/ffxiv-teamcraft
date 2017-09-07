import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {TranslateService} from '@ngx-translate/core';
import {GarlandToolsService} from './garland-tools.service';
import {Recipe} from '../../model/garland-tools/recipe';
import {I18nName} from '../../model/i18n-name';

@Injectable()
export class DataService {

    private xivdbUrl = 'https://api.xivdb.com';
    private garlandUrl = 'https://www.garlandtools.org/db/data';

    constructor(private http: HttpClient,
                private i18n: TranslateService,
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
                                url_xivdb: this.getXivdbUrl(item.id, item.en.name)
                            };
                            res.push(recipe);
                        }
                    }
                    return res;
                });
            });
    }

    public getXivdbUrl(id: number, name: string): I18nName {
        const urlName = name.replace(/ /g, '+').toLowerCase();
        return {
            fr: `http://fr.xivdb.com/item/${id}/${urlName}`,
            en: `http://xivdb.com/item/${id}/${urlName}`,
            de: `http://de.xivdb.com/item/${id}/${urlName}`,
            ja: `http://ja.xivdb.com/item/${id}/${urlName}`
        };
    }

    public searchCharacter(name: string, server: string): Observable<any[]> {
        return this.http.get<any>(`https://xivsync.com/character/search?name=${name}&server=${server}`)
            .map(res => res.data.results)
            .map(res => res.filter(char => char.name === name));
    }

    public getCharacter(id: number): Observable<any> {
        return this.http.get<any>(`https://xivsync.com/character/parse/${id}`);
    }

    private getXivdb(uri: string): Observable<any> {
        return this.http.get<any>(this.xivdbUrl + uri);
    }

    private getGarland(uri: string): Observable<any> {
        return this.http.get<any>(this.garlandUrl + uri + '.json');
    }
}
