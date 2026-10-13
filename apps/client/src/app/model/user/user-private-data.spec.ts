import { hasLegacyPrivateData, mergeUserData, splitUserData } from './user-private-data';

describe('User private data', () => {

  const user = {
    nickname: 'Miu',
    admin: false,
    patreonToken: 'patreon-token',
    ksEmail: 'backer@example.com',
    contacts: ['friend'],
    favorites: { lists: ['list-a'], workshops: [] },
    itemTags: [{ id: 2, tag: 'shards' }],
    cid: '1234',
    currentFcId: '9999',
    world: 42,
    lodestoneIds: [{ id: 1, verified: true, contentId: 'content-1' }, { id: 2, verified: false }],
    customCharacters: [{ ID: -1, Name: 'Custom', contentId: 'content-custom' }]
  };

  it('Should move private fields and ContentIDs out of the public document', () => {
    const { publicData, privateData } = splitUserData(user);
    expect(publicData).toEqual({
      nickname: 'Miu',
      admin: false,
      lodestoneIds: [{ id: 1, verified: true }, { id: 2, verified: false }],
      customCharacters: [{ ID: -1, Name: 'Custom' }]
    });
    expect(privateData).toEqual({
      patreonToken: 'patreon-token',
      ksEmail: 'backer@example.com',
      contacts: ['friend'],
      favorites: { lists: ['list-a'], workshops: [] },
      itemTags: [{ id: 2, tag: 'shards' }],
      cid: '1234',
      currentFcId: '9999',
      world: 42,
      contentIds: { 1: 'content-1', [-1]: 'content-custom' }
    });
  });

  it('Should rebuild the same user from its split documents', () => {
    const { publicData, privateData } = splitUserData(user);
    expect(mergeUserData(publicData, privateData)).toEqual(user);
  });

  it('Should read a never-migrated document as-is', () => {
    expect(mergeUserData(user, null)).toEqual(user);
  });

  it('Should merge private data written back by an older client', () => {
    const { publicData, privateData } = splitUserData(user);
    const writtenByOldClient = {
      ...publicData,
      contacts: ['new-friend'],
      favorites: { lists: ['list-b'], rotations: ['rotation-a'] },
      patreonToken: 'rotated-token',
      lodestoneIds: [{ id: 1, verified: true, contentId: 'content-1-new' }, { id: 2, verified: false }]
    };
    const merged = mergeUserData(writtenByOldClient, privateData);
    expect(merged.contacts).toEqual(['friend', 'new-friend']);
    expect(merged.favorites).toEqual({ lists: ['list-a', 'list-b'], workshops: [], rotations: ['rotation-a'] });
    expect(merged.patreonToken).toBe('rotated-token');
    expect(merged.ksEmail).toBe('backer@example.com');
    expect(merged.lodestoneIds[0].contentId).toBe('content-1-new');
  });

  it('Should detect private data left on a public document', () => {
    const { publicData } = splitUserData(user);
    expect(hasLegacyPrivateData(publicData)).toBe(false);
    expect(hasLegacyPrivateData({ ...publicData, contacts: [] })).toBe(true);
    expect(hasLegacyPrivateData({ ...publicData, lodestoneIds: [{ id: 1, verified: true, contentId: 'content-1' }] })).toBe(true);
  });
});
