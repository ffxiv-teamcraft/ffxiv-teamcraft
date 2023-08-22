import { XIVSearch } from './xiv-search';
import { join } from 'path';
import { SearchType } from '@ffxiv-teamcraft/types';

describe('search', () => {

  describe('Item', () => {

    let search: XIVSearch;

    beforeAll((done) => {
      search = new XIVSearch('en', join(__dirname, '../../../data/src/lib/json'));
      search.buildIndex(SearchType.ITEM).subscribe(() => {
        done();
      });
    }, 50000);

    it('should work', () => {
      expect(search.hasIndex(SearchType.ITEM)).toBeTruthy();
    });

    it('should do perfect matches properly', () => {
      expect(search.search(SearchType.ITEM, 'Iron Ingot')[0].itemId).toBe(5057);
      expect(search.search(SearchType.ITEM, 'Iron Ore')[0].itemId).toBe(5111);
    });

    it('should handle very fuzzy shit like Maito does', () => {
      expect(search.search(SearchType.ITEM, 'gr 8 he m')[0].itemId).toBe(39726);
    });

    it('should ingest fast', (done) => {
      const start = performance.now();
      const test = new XIVSearch('en', join(__dirname, '../../../data/src/lib/json'));
      test.buildIndex(SearchType.ITEM).subscribe(() => {
        expect(performance.now() - start).toBeLessThan(5000);
        done();
      });
    }, 10000);

    it('should search fast', () => {
      const start = performance.now();
      search.search(SearchType.ITEM, 'Iron');
      expect(performance.now() - start).toBeLessThan(20);
    });

    it('should work with French (accents !)', (done) => {
      const frSearch = new XIVSearch('fr', join(__dirname, '../../../data/src/lib/json'));
      frSearch.buildIndex(SearchType.ITEM).subscribe(() => {
        expect(frSearch.search(SearchType.ITEM, 'Minerai de fer')[0].itemId).toBe(5111);
        expect(frSearch.search(SearchType.ITEM, 'épée').length).toBeGreaterThan(0);
        done();
      });
    }, 10000);

    it('should work with japanese', (done) => {
      const jaSearch = new XIVSearch('ja', join(__dirname, '../../../data/src/lib/json'));
      jaSearch.buildIndex(SearchType.ITEM).subscribe(() => {
        expect(jaSearch.search(SearchType.ITEM, 'MGスサノオ')[0].itemId).toBe(17962);
        expect(jaSearch.search(SearchType.ITEM, 'スサ').find(row => row.itemId === 17962)).toBeDefined();
        done();
      });
    }, 10000);

    it('should work with Korean', (done) => {
      const koSearch = new XIVSearch('ko', join(__dirname, '../../../data/src/lib/json'));
      koSearch.buildIndex(SearchType.ITEM).subscribe(() => {
        expect(koSearch.search(SearchType.ITEM, '몰리브덴 주괴')[0].itemId).toBe(19947);
        expect(koSearch.search(SearchType.ITEM, '몰리브덴').find(row => row.itemId === 19947)).toBeDefined();
        expect(koSearch.search(SearchType.ITEM, 'Oblivion').length).toBeGreaterThan(0);
        done();
      });
    }, 10000);

    it('should work with Chinese', (done) => {
      const zhSearch = new XIVSearch('zh', join(__dirname, '../../../data/src/lib/json'));
      zhSearch.buildIndex(SearchType.ITEM).subscribe(() => {
        expect(zhSearch.search(SearchType.ITEM, '吉祥天女模型')[0].itemId).toBe(17961);
        expect(zhSearch.search(SearchType.ITEM, '吉祥').find(row => row.itemId === 17961)).toBeDefined();
        done();
      });
    }, 10000);

    describe('Filters', () => {
      it('should work with simple filters and no query', () => {
        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'ilvl',
            operator: '=',
            value: 580
          },
          {
            field: 'craftable',
            operator: '=',
            value: true
          }
        ]).find(row => row.itemId === 35020)).toBeDefined();
      });

      it('should work with simple filters and a text query', () => {
        const results = search.search(SearchType.ITEM, 'Longsword', [
          {
            field: 'ilvl',
            operator: '=',
            value: 580
          },
          {
            field: 'craftable',
            operator: '=',
            value: true
          }
        ]);
        expect(results.length).toBe(1);
        expect(results.find(row => row.itemId === 35020)).toBeDefined();
      });

      it('should work with stats filters', () => {
        // Should at least return classical cane
        const results = search.search(SearchType.ITEM, '', [
          {
            // 5 is Mind
            field: 'stats.5',
            operator: '>=',
            value: 150
          },
          {
            // 5 is Mind
            field: 'stats.5',
            operator: '<',
            value: 999
          }
        ]);
        expect(results.find(row => row.itemId === 35028)).toBeDefined();
      });

      it('should work with an id filter', () => {
        // Susano Miniature
        const results = search.search(SearchType.ITEM, '', [
          {
            field: 'data.itemId',
            operator: '=',
            value: 17962
          }
        ]);
        expect(results.length).toBe(1);
        expect(results[0].itemId).toBe(17962);
      });

      it('should work with bonus filters', () => {
        // Should at least return classical cane
        const results = search.search(SearchType.ITEM, '', [
          {
            // 70 is Craftsmanship
            field: 'bonuses.70.Max',
            operator: '>=',
            value: 50
          },
          {
            // 70 is Craftsmanship
            field: 'bonuses.70.Max',
            operator: '<',
            value: 999
          }
        ]);
        expect(results.find(row => row.itemId === 19824)).toBeDefined();
        // Should at least return classical cane
        const results2 = search.search(SearchType.ITEM, '', [
          {
            // 70 is Craftsmanship
            field: 'bonuses.70.NQ',
            operator: '>',
            value: 0
          }
        ]);
        expect(results2.find(row => row.itemId === 19824)).toBeDefined();
      });

      it('should work with exclude filter operator', () => {
        // Should at least return classical cane
        const results = search.search(SearchType.ITEM, '', [
          {
            // 70 is Craftsmanship
            field: 'bonuses.70.Max',
            operator: '>=',
            value: 50
          },
          {
            // 11 is CP
            field: 'bonuses.11',
            operator: '!!'
          }
        ]);
        expect(results.find(row => row.itemId === 19824)).toBeUndefined();
        expect(results.find(row => row.itemId === 19834)).toBeDefined();
      });

      it('should work with "one of" filter operator', () => {
        // Should at least return classical cane
        const results = search.search(SearchType.ITEM, '', [
          {
            field: 'category',
            operator: '|=',
            value: [1, 2, 3]
          },
          {
            field: 'craftable',
            operator: '=',
            value: true
          },
          {
            field: 'elvl',
            operator: '=',
            value: 90
          }
        ]);
        // Shouldn't contain a bow
        expect(results.find(row => row.itemId === 35024)).toBeUndefined();
        // Should contain a longsword
        expect(results.find(row => row.itemId === 35020)).toBeDefined();
      });

      it('should support every filter that TC has to offer for items', () => {
        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'ilvl',
            operator: '=',
            value: 580
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'clvl',
            operator: '=',
            value: 80
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'elvl',
            operator: '=',
            value: 80
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'mDef',
            operator: '>',
            value: 80
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'pDef',
            operator: '>',
            value: 80
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'pDmg',
            operator: '>',
            value: 80
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'mDmg',
            operator: '>',
            value: 80
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'delay',
            operator: '>',
            value: 2000
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'stats.5',
            operator: '>',
            value: 10
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'bonuses.5.Max',
            operator: '>',
            value: 10
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'cjc.PLD',
            operator: '=',
            value: 1
          }
        ]).length).toBeGreaterThan(0);

        expect(search.search(SearchType.ITEM, '', [
          {
            field: 'category',
            operator: '|=',
            value: [1, 2, 3]
          }
        ]).length).toBeGreaterThan(0);
      });

    });

  });

  describe('Action', () => {
    let search: XIVSearch;

    beforeAll((done) => {
      search = new XIVSearch('en', join(__dirname, '../../../data/src/lib/json'));
      search.buildIndex(SearchType.ACTION).subscribe(() => {
        done();
      });
    }, 5000);

    it('should work', () => {
      expect(search.hasIndex(SearchType.ACTION)).toBeTruthy();
    });

    it('should do perfect matches properly', () => {
      expect(search.search(SearchType.ACTION, 'Benediction')[0].id).toBe(140);
    });

    it('should ingest fast', (done) => {
      const start = performance.now();
      const test = new XIVSearch('en', join(__dirname, '../../../data/src/lib/json'));
      test.buildIndex(SearchType.ACTION).subscribe(() => {
        expect(performance.now() - start).toBeLessThan(5000);
        done();
      });
    }, 0);


    it('should support every filter that TC has to offer for actions', () => {
      expect(search.search(SearchType.ACTION, '', [
        {
          field: 'lvl',
          operator: '>=',
          value: 90
        },
        {
          field: 'lvl',
          operator: '<=',
          value: 90
        }
      ]).length).toBeGreaterThan(0);
      expect(search.search(SearchType.ACTION, '', [
        {
          field: 'job',
          operator: '=',
          value: 14
        }
      ]).length).toBeGreaterThan(0);

    });
  });
});
