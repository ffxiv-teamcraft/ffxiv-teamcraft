import { XIVSearch } from './search';
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
  })
});
