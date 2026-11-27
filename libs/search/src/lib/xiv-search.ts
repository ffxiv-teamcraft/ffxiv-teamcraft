// eslint-disable-next-line @nx/enforce-module-boundaries
import { I18nName, LazyDataKey, LazyDataSearchIndexKey, LazyDataWithExtracts, SearchResult, SearchType } from '@ffxiv-teamcraft/types';
import { combineLatest, Observable, of, switchMap } from 'rxjs';
import { readFile } from 'fs';
import { join } from 'path';
import { lazyFilesList } from '@ffxiv-teamcraft/data/lazy-files-list';
import { LazyData } from '@ffxiv-teamcraft/data/model/lazy-data';
import { Document } from 'flexsearch-ts';
import { ArrayIncludesXIVSearchFilter, XIVSearchFilter } from './xiv-search-filter';
import { get } from 'lodash';
import * as zlib from 'zlib';

export class XIVSearch {

  // private indexes: Partial<Record<SearchType, typeof Fuse.default>> = {};
  private indexes: Partial<Record<SearchType, Document<any, true>>> = {};

  private rawData: Partial<Record<SearchType, (I18nName & any)[]>> = {};

  private fuzzyData: Partial<Record<SearchType, { entries: { row: any, words: string[], nameLength: number }[], vocabulary: string[] }>> = {};

  constructor(private lang: keyof I18nName, private lazyDataPath: string) {
  }

  public hasIndex(content: SearchType) {
    return this.indexes[content] !== undefined;
  }

  public buildIndex(content: SearchType): Observable<unknown> {
    if (!this.getSearchIndexKey(content) || this.rawData[content] !== undefined) {
      return of(null);
    }
    return this.getSearchIndex(this.getSearchIndexKey(content)).pipe(
      switchMap((data) => {
        this.rawData[content] = data;
        this.indexes[content] = new Document({
          language: this.lang,
          encode: doc => {
            let str = doc;
            // This is due to an inconsistency in the encoder
            // When ingesting, it's called with a document object, when searching, it's called with a string.
            if (typeof doc === 'object' && doc) {
              str = doc[this.lang];
            }
            const normalized = XIVSearch.normalize(`${str ?? ''}`);
            if (['ko', 'zh', 'tw'].includes(this.lang)) {
              return normalized.split('');
            }
            return normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
          },
          document: {
            id: 'id',
            index: [this.lang],
            store: true
          },
          optimize: true,
          tokenize: 'full',
          cache: true,
          context: {
            bidirectional: true,
            resolution: 9,
            depth: 1
          }
        });
        return combineLatest(data.map(row => {
            return new Observable(subscriber => {
              this.indexes[content].addAsync(row.id, row, () => {
                subscriber.next();
                subscriber.complete();
              });
            });
          })
        );
      })
    );
  }

  public search(content: SearchType, query: string, filters: XIVSearchFilter[] = [], sort: [string, 'asc' | 'desc'] = ['', 'asc']): SearchResult[] {
    if (query.length === 0 && filters.length === 0) {
      return [];
    }
    if (!this.hasIndex(content)) {
      throw new Error(`Trying to search on missing index ${content}, please build index first !`);
    }
    let results = [];
    if (query.length === 0) {
      results = this.rawData[content];
    } else {
      results = this.indexes[content].search<true>(query, 1000, { enrich: true, limit: Infinity })
        .map(res => {
          return res.result.map(row => {
            return row.doc;
          });
        })
        .flat();
      // If exact matching gives (almost) nothing, fall back to typo-tolerant matching.
      if (results.length < XIVSearch.FUZZY_THRESHOLD && XIVSearch.supportsFuzzy(this.lang)) {
        const seen = new Set(results.map(row => row.id));
        results = [
          ...results,
          ...this.fuzzySearch(content, query).filter(row => !seen.has(row.id))
        ];
      }
    }
    return results
      .filter(doc => {
        return filters.every((f: XIVSearchFilter) => {
          return this.doCompare(get(doc, f.field), f.operator, f.value);
        });
      })
      .sort((a, b) => {
        const [field, direction] = sort;
        if (field === '') {
          return 0;
        }
        if (direction === 'asc') {
          return a[field] < b[field] ? -1 : 1;
        }
        return b[field] < a[field] ? -1 : 1;
      })
      .map(row => {
        return {
          en: row.en,
          de: row.de,
          ja: row.ja,
          fr: row.fr,
          ko: row.ko,
          zh: row.zh,
          tw: row.tw,
          ...row.data
        };
      });
  }

  private static readonly FUZZY_THRESHOLD = 10;

  private static readonly FUZZY_LIMIT = 200;

  /**
   * Lowercases and strips Latin diacritics so "Éther", "ether" and "ETHER" are treated the same.
   * Only combining marks in the U+0300-U+036F range are removed, so Japanese dakuten and Hangul are left intact.
   */
  public static normalize(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .normalize('NFC')
      .toLowerCase();
  }

  private static supportsFuzzy(lang: keyof I18nName): boolean {
    return ['en', 'de', 'fr'].includes(lang);
  }

  private static tokenize(str: string): string[] {
    return XIVSearch.normalize(str).split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  }

  /**
   * How many typos are allowed for a query token of the given length.
   */
  private static maxTypos(length: number): number {
    if (length <= 2) {
      return 0;
    }
    if (length <= 6) {
      return 1;
    }
    return 2;
  }

  /**
   * Optimal string alignment distance (Levenshtein + adjacent transpositions), bailing out once above max.
   */
  private static editDistance(a: string, b: string, max: number): number {
    if (Math.abs(a.length - b.length) > max) {
      return max + 1;
    }
    let prevPrev: number[] = [];
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const current = [i];
      let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let value = Math.min(prev[j] + 1, current[j - 1] + 1, prev[j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          value = Math.min(value, prevPrev[j - 2] + 1);
        }
        current[j] = value;
        rowMin = Math.min(rowMin, value);
      }
      if (rowMin > max) {
        return max + 1;
      }
      prevPrev = prev;
      prev = current;
    }
    return prev[b.length];
  }

  /**
   * Scores how well a query token matches a word, lower is better, -1 if it doesn't match.
   * Substrings match for free, prefixes and whole words with a few typos are tolerated.
   */
  private static tokenScore(token: string, word: string): number {
    if (word.includes(token)) {
      return 0;
    }
    const max = XIVSearch.maxTypos(token.length);
    if (max === 0) {
      return -1;
    }
    const whole = XIVSearch.editDistance(token, word, max);
    // Also compare against the beginning of the word, so partially typed words still match.
    const prefix = token.length >= 4 && word.length > token.length
      ? XIVSearch.editDistance(token, word.slice(0, token.length), max)
      : max + 1;
    const best = Math.min(whole, prefix);
    return best <= max ? best : -1;
  }

  private fuzzySearch(content: SearchType, query: string): any[] {
    const queryTokens = XIVSearch.tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }
    const { entries, vocabulary } = this.getFuzzyData(content);
    // Score each distinct word once per query token instead of once per row.
    const tokenScores = queryTokens.map(token => {
      const scores = new Map<string, number>();
      for (const word of vocabulary) {
        const score = XIVSearch.tokenScore(token, word);
        if (score !== -1) {
          scores.set(word, score);
        }
      }
      return scores;
    });
    if (tokenScores.some(scores => scores.size === 0)) {
      return [];
    }
    const matches: { row: any, score: number }[] = [];
    for (const entry of entries) {
      let score = 0;
      for (const scores of tokenScores) {
        let best = -1;
        for (const word of entry.words) {
          const s = scores.get(word);
          if (s !== undefined && (best === -1 || s < best)) {
            best = s;
          }
        }
        if (best === -1) {
          score = -1;
          break;
        }
        score += best;
      }
      if (score !== -1) {
        // Prefer closer matches, then shorter names (closer to what was typed).
        matches.push({ row: entry.row, score: score * 1000 + entry.nameLength });
      }
    }
    return matches
      .sort((a, b) => a.score - b.score)
      .slice(0, XIVSearch.FUZZY_LIMIT)
      .map(m => m.row);
  }

  private getFuzzyData(content: SearchType): { entries: { row: any, words: string[], nameLength: number }[], vocabulary: string[] } {
    if (!this.fuzzyData[content]) {
      const vocabulary = new Set<string>();
      const entries = (this.rawData[content] || [])
        .filter(row => !!row[this.lang])
        .map(row => {
          const words = XIVSearch.tokenize(row[this.lang]);
          words.forEach(word => vocabulary.add(word));
          return { row, words, nameLength: row[this.lang].length };
        });
      this.fuzzyData[content] = { entries, vocabulary: [...vocabulary] };
    }
    return this.fuzzyData[content];
  }

  private doCompare(value: any, operator: XIVSearchFilter['operator'], filterValue?: XIVSearchFilter['value']): boolean {
    switch (operator) {
      case '=':
        return value === filterValue;
      case '>':
        return value > filterValue;
      case '<':
        return value < filterValue;
      case '<=':
        return value <= filterValue;
      case '>=':
        return value >= filterValue;
      case '!!':
        return value == null;
      case '|=':
        return (filterValue as ArrayIncludesXIVSearchFilter['value']).includes(+value);
    }
  }

  private getSearchIndexKey(content: SearchType): LazyDataSearchIndexKey {
    switch (content) {
      case SearchType.MONSTER:
        return 'monsterSearch';
      case SearchType.FATE:
        return 'fateSearch';
      case SearchType.MAP:
        return 'mapSearch';
      case SearchType.STATUS:
        return 'statusSearch';
      case SearchType.TRAIT:
        return 'traitSearch';
      case SearchType.ACHIEVEMENT:
        return 'achievementSearch';
      case SearchType.FISHING_SPOT:
        return 'fishingSpotSearch';
      case SearchType.GATHERING_NODE:
        return 'gatheringNodeSearch';
      case SearchType.ITEM:
        return 'itemSearch';
      case SearchType.ACTION:
        return 'actionSearch';
      case SearchType.INSTANCE:
        return 'instanceSearch';
      case SearchType.QUEST:
        return 'questSearch';
      case SearchType.NPC:
        return 'npcSearch';
      case SearchType.LEVE:
        return 'leveSearch';

      default:
    }
  }

  private getSearchIndex<K extends LazyDataKey>(contentName: K): Observable<LazyDataWithExtracts[K]> {
    const lazyFile = lazyFilesList[contentName as keyof LazyData];
    if (!lazyFile) {
      throw new Error('Trying to load missing lazy file ' + contentName);
    }
    const fileName = lazyFile.fileName;
    return new Observable<LazyDataWithExtracts[K]>(observer => {
      readFile(join(this.lazyDataPath, fileName), (err, content) => {
        if (err) {
          throw err;
        }
        zlib.inflate(content, { level: 9 }, (err, data) => {
          if (err) {
            observer.error(err);
            observer.complete();
          } else {
            observer.next(JSON.parse(data.toString()));
            observer.complete();
          }
        });
      });
    });
  }

}
