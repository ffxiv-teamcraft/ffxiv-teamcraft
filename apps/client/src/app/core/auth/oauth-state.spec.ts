import { consumeOauthState, createOauthState } from './oauth-state';

describe('OAuth state', () => {

  beforeEach(() => localStorage.clear());

  afterEach(() => jest.restoreAllMocks());

  it('Should accept the state it created, only once', () => {
    const state = createOauthState('discord', 'team-key');
    expect(consumeOauthState('discord', state)).toEqual({ data: 'team-key' });
    expect(consumeOauthState('discord', state)).toBeNull();
  });

  it('Should reject a missing or forged state without cancelling the pending one', () => {
    const state = createOauthState('patreon');
    expect(consumeOauthState('patreon', undefined)).toBeNull();
    expect(consumeOauthState('patreon', 'forged-state')).toBeNull();
    expect(consumeOauthState('tipeee', state)).toBeNull();
    expect(consumeOauthState('patreon', state)).not.toBeNull();
  });

  it('Should reject an expired state', () => {
    const now = Date.now();
    const dateNow = jest.spyOn(Date, 'now').mockReturnValue(now);
    const state = createOauthState('patreon');
    dateNow.mockReturnValue(now + 11 * 60 * 1000);
    expect(consumeOauthState('patreon', state)).toBeNull();
  });

  it('Should generate unpredictable states', () => {
    const states = new Set(Array.from({ length: 20 }, () => createOauthState('patreon')));
    expect(states.size).toBe(20);
    states.forEach(state => expect(state).toMatch(/^[0-9a-f]{48}$/));
  });
});
