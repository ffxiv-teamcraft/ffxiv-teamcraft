import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {TranslateService} from '@ngx-translate/core';
import {GarlandToolsService} from './garland-tools.service';
import {Recipe} from '../../model/list/recipe';
import {ItemData} from '../../model/garland-tools/item-data';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {SearchFilter} from '../../model/search/search-filter.interface';
import 'rxjs/add/operator/publishReplay';

@Injectable()
export class DataService {

    private garlandUrl = 'https://www.garlandtools.org/db/doc';
    private garlandtoolsVersion = 2;
    private garlandApiUrl = 'https://www.garlandtools.org/api';

    private characterCache = new Map<number, Observable<any>>();

    constructor(private http: HttpClient,
                private i18n: TranslateService,
                private gt: GarlandToolsService,
                private serializer: NgSerializerService) {
    }

    /**
     * Gets an item based on its id.
     * @param {number} id
     * @returns {Observable<ItemData>}
     */
    public getItem(id: number): Observable<ItemData> {
        return this.getGarlandData(`/item/en/${this.garlandtoolsVersion}/${id}`)
            .map(item => this.serializer.deserialize<ItemData>(item, ItemData));
    }

    /**
     * Fires a search request to the search api in order to get results based on filters.
     * @param {string} query
     * @param {SearchFilter[]} filters
     * @returns {Observable<Recipe[]>}
     */
    public searchRecipe(query: string, filters: SearchFilter[]): Observable<Recipe[]> {
        let params = new HttpParams()
            .set('craftable', '1')
            .set('lang', this.i18n.currentLang);

        let craftedByFilter: SearchFilter;

        if (query !== undefined) {
            params = params.set('text', query);
        }

        filters.forEach(filter => {
            if (filter.enabled) {
                if (filter.minMax) {
                    params = params.set(`${filter.filterName}Min`, filter.value.min)
                        .set(`${filter.filterName}Max`, filter.value.max);
                } else if (filter.name === 'filters/worn_by') {
                    params = params.set(filter.filterName, this.gt.getJobCategories(filter.value).join(','));
                } else {
                    params = params.set(filter.filterName, filter.value);
                }
                if (filter.name === 'filters/crafted_by') {
                    craftedByFilter = filter;
                }
            }
        });

        return this.getGarlandSearch(params).map(garlandResults => {
            const recipes: Recipe[] = [];
            garlandResults.forEach(item => {
                item.obj.f.forEach(recipe => {
                    if (craftedByFilter !== undefined && craftedByFilter.value !== recipe.job) {
                        return;
                    }
                    recipes.push({
                        recipeId: recipe.id,
                        itemId: item.id,
                        job: recipe.job,
                        stars: recipe.stars,
                        lvl: recipe.lvl,
                        icon: item.obj.c,
                        collectible: item.obj.o === 1
                    });
                });
            });
            return recipes;
        });
    }

    /**
     * Searchs for a character using a lodestone id.
     * @param {string} name
     * @param {string} server
     * @returns {Observable<any[]>}
     */
    public searchCharacter(name: string, server: string): Observable<any[]> {
        return this.http.get<any>(`https://xivsync.com/character/search?name=${name}&server=${server}`)
            .map(res => res.data.results)
            .map(res => res.filter(char => char.name.toLowerCase() === name.toLowerCase()));
    }

    /**
     * gets a character by lodestone id.
     * @param {number} id
     * @returns {Observable<any>}
     */
    public getCharacter(id: number): Observable<any> {
        if (!this.characterCache.get(id)) {
            const request = this.http.get<any>(`https://xivsync.com/character/parse/${id}`).map(result => result.data)
                .publishReplay(1)
                .refCount()
                .take(1);
            this.characterCache.set(id, request);
        }
        return this.characterCache.get(id);
    }

    /**
     * Gets details about a free company.
     * @param {number} id
     * @returns {Observable<any>}
     */
    public getFreeCompany(id: number): Observable<any> {
        return this.http.get<any>(`https://xivsync.com/freecompany/parse/${id}`).map(result => result.data)
            .publishReplay(1)
            .refCount()
    }

    /**
     * Creates a request to garlandtools.org.
     * @param {string} uri
     * @returns {Observable<any>}
     */
    private getGarlandData(uri: string): Observable<any> {
        return this.http.get<any>(this.garlandUrl + uri + '.json');
    }

    /**
     * Creates a search request to garlandtools.org.
     * @param {HttpParams} query
     * @returns {Observable<any>}
     */
    private getGarlandSearch(query: HttpParams): Observable<any> {
        return this.http.get<any>(`${this.garlandApiUrl}/search.php`, {params: query});
    }
}
