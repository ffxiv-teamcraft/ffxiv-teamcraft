import { Entity, AuthState } from './auth.reducer';
import { authQuery } from './auth.selectors';

describe('Auth Selectors', () => {
  const ERROR_MSG = 'No Error Available';
  const getAuthId = it => it['id'];

  let storeState;

  beforeEach(() => {
    const createAuth = (id: string, name = ''): Entity => ({
      id,
      name: name || `name-${id}`
    });
    storeState = {
      auth: {
        list: [
          createAuth('PRODUCT-AAA'),
          createAuth('PRODUCT-BBB'),
          createAuth('PRODUCT-CCC')
        ],
        selectedId: 'PRODUCT-BBB',
        error: ERROR_MSG,
        loaded: true
      }
    };
  });

  describe('Auth Selectors', () => {
    it('getAllAuth() should return the list of Auth', () => {
      const results = authQuery.getAllAuth(storeState);
      const selId = getAuthId(results[1]);

      expect(results.length).toBe(3);
      expect(selId).toBe('PRODUCT-BBB');
    });

    it('getSelectedAuth() should return the selected Entity', () => {
      const result = authQuery.getSelectedAuth(storeState);
      const selId = getAuthId(result);

      expect(selId).toBe('PRODUCT-BBB');
    });

    it("getLoaded() should return the current 'loaded' status", () => {
      const result = authQuery.getLoaded(storeState);

      expect(result).toBe(true);
    });

    it("getError() should return the current 'error' storeState", () => {
      const result = authQuery.getError(storeState);

      expect(result).toBe(ERROR_MSG);
    });
  });
});
