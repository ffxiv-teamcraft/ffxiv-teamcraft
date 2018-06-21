import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {GarlandToolsService} from './garland-tools.service';
import {Recipe} from '../../model/list/recipe';
import {ItemData} from '../../model/garland-tools/item-data';
import {NgSerializerService} from '@kaiu/ng-serializer';
import {SearchFilter} from '../../model/search/search-filter.interface';

import {GearSet} from '../../pages/simulator/model/gear-set';
import {map, mergeMap, publishReplay, refCount, take} from 'rxjs/operators';
import {SearchResult} from '../../model/list/search-result';

@Injectable()
export class DataService {

    static craftingJobs = [
        {abbr: 'CRP', name: 'carpenter'},
        {abbr: 'BSM', name: 'blacksmith'},
        {abbr: 'ARM', name: 'armorer'},
        {abbr: 'LTW', name: 'leatherworker'},
        {abbr: 'WVR', name: 'weaver'},
        {abbr: 'GSM', name: 'goldsmith'},
        {abbr: 'ALC', name: 'alchemist'},
        {abbr: 'CUL', name: 'culinarian'},
        {abbr: 'MIN', name: 'miner'},
        {abbr: 'BTN', name: 'botanist'},
        {abbr: 'FSH', name: 'fisher'}
    ];

    private garlandUrl = 'https://www.garlandtools.org/db/doc';
    private garlandtoolsVersion = 2;
    private garlandApiUrl = 'https://www.garlandtools.org/api';

    private characterCache = new Map<number, Observable<any>>();

    constructor(private http: HttpClient,
                private i18n: TranslateService,
                private gt: GarlandToolsService,
                private serializer: NgSerializerService) {
    }

    public getGearsets(lodestoneId: number, onlyCraft = true): Observable<GearSet[]> {
        return this.getCharacter(lodestoneId)
            .pipe(
                mergeMap(character => {
                    return this.http.get(`https://api.xivdb.com/character/${lodestoneId}?data=gearsets`)
                        .pipe(
                            map((response: any[]) => {
                                return response
                                // We want only crafter sets
                                    .filter(row => row.classjob_id >= 8 && row.classjob_id <= (onlyCraft ? 15 : 18))
                                    .map(set => {
                                        let setLevel = 70;
                                        if (character.classjobs !== undefined) {
                                            // Get real level from lodestone profile as it's way more accurate and up to date, if not found,
                                            // default to set level.
                                            setLevel = (
                                                (Object.keys(character.classjobs || {}))
                                                    .map(key => character.classjobs[key])
                                                    .find(job => job.name === set.role.name) || set).level;
                                        }
                                        return {
                                            ilvl: set.item_level_avg,
                                            jobId: set.classjob_id,
                                            level: setLevel,
                                            control: set.stats.mental !== undefined ? set.stats.mental.Control : 0,
                                            craftsmanship: set.stats.mental !== undefined ? set.stats.mental.Craftsmanship : 0,
                                            cp: set.stats.core !== undefined ? set.stats.core.CP : 0,
                                            specialist: set.slot_soulcrystal !== null
                                        }
                                    });
                            }),
                            map(sets => {
                                const jobIds = onlyCraft ?
                                    [8, 9, 10, 11, 12, 13, 14, 15] :
                                    [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
                                jobIds.forEach(jobId => {
                                    if (sets.find(set => set.jobId === jobId) === undefined) {
                                        let level = 70;
                                        if (character.classjobs !== undefined) {
                                            level = character.classjobs[DataService.craftingJobs[jobId - 8].name].level
                                        }
                                        sets.push({
                                            ilvl: 0,
                                            control: 1350,
                                            craftsmanship: 1500,
                                            cp: 474,
                                            jobId: jobId,
                                            level: level,
                                            specialist: false
                                        });
                                    }
                                });
                                return sets.sort((a, b) => a.jobId - b.jobId);
                            })
                        );
                })
            )

    }

    /**
     * Gets an item based on its id.
     * @param {number} id
     * @returns {Observable<ItemData>}
     */
    public getItem(id: number): Observable<ItemData> {
        return this.getGarlandData(`/item/en/${this.garlandtoolsVersion}/${id}`)
            .pipe(map(item => this.serializer.deserialize<ItemData>(item, ItemData)));
    }

    /**
     * Fires a search request to the search api in order to get results based on filters.
     * @param {string} query
     * @param {SearchFilter[]} filters
     * @param onlyCraftable
     * @returns {Observable<Recipe[]>}
     */
    public searchItem(query: string, filters: SearchFilter[], onlyCraftable: boolean): Observable<SearchResult[]> {
        let params = new HttpParams()
            .set('type', 'item')
            .set('lang', this.i18n.currentLang);

        if (onlyCraftable) {
            params = params.set('craftable', '1');
        }

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

        return this.getGarlandSearch(params)
            .pipe(
                map(garlandResults => {
                    const results: SearchResult[] = [];
                    garlandResults.forEach(item => {
                        if (item.obj.f !== undefined) {
                            item.obj.f.forEach(recipe => {
                                if (craftedByFilter !== undefined && craftedByFilter.value !== recipe.job) {
                                    return;
                                }
                                results.push(<Recipe>{
                                    recipeId: recipe.id,
                                    itemId: item.id,
                                    job: recipe.job,
                                    stars: recipe.stars,
                                    lvl: recipe.lvl,
                                    icon: item.obj.c,
                                    collectible: item.obj.o === 1
                                });
                            });
                        } else {
                            results.push({
                                itemId: item.id,
                                icon: item.obj.c
                            });
                        }
                    });
                    return results;
                })
            );
    }

    /**
     * Searches for gathering items based on a given name.
     * @param {string} name
     * @returns {Observable<ItemData[]>}
     */
    public searchGathering(name: string): Observable<any[]> {
        let lang = this.i18n.currentLang;
        if (['en', 'fr', 'de', 'ja'].indexOf(lang) === -1) {
            lang = 'en';
        }
        const params = new HttpParams()
            .set('gatherable', '1')
            .set('type', 'item')
            .set('text', name)
            .set('lang', lang);
        return this.getGarlandSearch(params);
    }

    /**
     * Searchs for a character using a lodestone id.
     * @param {string} name
     * @param {string} server
     * @returns {Observable<any[]>}
     */
    public searchCharacter(name: string, server: string): Observable<any[]> {
        return this.http.get<any>(`https://xivsync.com/character/search?name=${name}&server=${server}`)
            .pipe(
                map(res => res.data.results),
                map(res => res.filter(char => char.name.toLowerCase() === name.toLowerCase()))
            );
    }

    /**
     * gets a character by lodestone id.
     * @param {number} id
     * @returns {Observable<any>}
     */
    public getCharacter(id: number): Observable<any> {
        if (!this.characterCache.get(id)) {
            const request = this.http.get<any>(`https://xivsync.com/character/parse/${id}`)
                .pipe(
                    map(result => result.data),
                    publishReplay(1),
                    refCount(),
                    take(1),
                    map(res => res !== false ? res : {name: 'Lodestone under maintenance'})
                );
            this.characterCache.set(id, request);
        }
        return this.characterCache.get(id);
    }

    /**
     * Gets details about a free company.
     * @param {number} id
     * @returns {Observable<any>}
     */
    public getFreeCompany(id: string): Observable<any> {
        return this.http.get<any>(`https://xivsync.com/freecompany/parse/${id}`)
            .pipe(
                map(result => result.data),
                publishReplay(1),
                refCount()
            );
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
