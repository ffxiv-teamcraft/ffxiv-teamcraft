/**
 * Properties only a user can read about themselves. They're stored in `users/{uid}/private/profile`
 * instead of the public `users/{uid}` document.
 */
export const PRIVATE_USER_FIELDS = [
  'patreonToken',
  'patreonRefreshToken',
  'lastPatreonRefresh',
  'tipeeeToken',
  'tipeeeRefreshToken',
  'lastTipeeeRefresh',
  'ksEmail',
  'contacts',
  'favorites',
  'itemTags',
  'defaultConsumables',
  'cid',
  'currentFcId',
  'world'
];

// Arrays merged as a union when both documents have a value, so nothing added from either side is lost.
const ARRAY_FIELDS = ['contacts', 'itemTags'];

type UserData = Record<string, any>;

export interface SplitUserData {
  publicData: UserData;
  privateData: UserData;
}

/**
 * Whether a public user document still holds private data: never migrated, or written by an older client.
 */
export function hasLegacyPrivateData(publicData: UserData): boolean {
  return PRIVATE_USER_FIELDS.some(field => field in publicData)
    || Object.keys(collectContentIds(publicData)).length > 0
    || getCharacterEntries(publicData).some(entry => entry && 'contentId' in entry);
}

/**
 * Splits a user into its public document and private profile.
 * ContentIDs are removed from `lodestoneIds` / `customCharacters` and stored in a private `contentIds` map.
 */
export function splitUserData(data: UserData): SplitUserData {
  const publicData: UserData = { ...data };
  const privateData: UserData = {};
  PRIVATE_USER_FIELDS.forEach(field => {
    if (data[field] !== undefined) {
      privateData[field] = data[field];
    }
    delete publicData[field];
  });
  const contentIds = collectContentIds(data);
  if (Object.keys(contentIds).length > 0) {
    privateData.contentIds = contentIds;
  }
  if (Array.isArray(data.lodestoneIds)) {
    publicData.lodestoneIds = data.lodestoneIds.map(stripContentId);
  }
  if (Array.isArray(data.customCharacters)) {
    publicData.customCharacters = data.customCharacters.map(stripContentId);
  }
  return { publicData, privateData };
}

/**
 * Builds a user from its public document and private profile.
 * Private data still on the public document wins over the private profile (it was written more recently
 * by an older client), except arrays and favorites which are merged so no entry is lost.
 */
export function mergeUserData(publicData: UserData, privateData: UserData | null | undefined): UserData {
  const profile = privateData || {};
  const merged: UserData = { ...publicData };
  PRIVATE_USER_FIELDS.forEach(field => {
    const legacy = publicData[field];
    const current = profile[field];
    if (legacy === undefined) {
      if (current !== undefined) {
        merged[field] = current;
      }
    } else if (current !== undefined) {
      merged[field] = mergeField(field, current, legacy);
    }
  });
  const contentIds = { ...(profile.contentIds || {}), ...collectContentIds(publicData) };
  if (Array.isArray(publicData.lodestoneIds)) {
    merged.lodestoneIds = publicData.lodestoneIds.map(entry => withContentId(entry, entry?.id, contentIds));
  }
  if (Array.isArray(publicData.customCharacters)) {
    merged.customCharacters = publicData.customCharacters.map(character => withContentId(character, character?.ID, contentIds));
  }
  return merged;
}

function mergeField(field: string, current: any, legacy: any): any {
  if (ARRAY_FIELDS.includes(field)) {
    return union(current, legacy);
  }
  if (field === 'favorites') {
    const keys = new Set([...Object.keys(current || {}), ...Object.keys(legacy || {})]);
    return [...keys].reduce((favorites, key) => {
      favorites[key] = union(current?.[key], legacy?.[key]);
      return favorites;
    }, {} as UserData);
  }
  return legacy;
}

function union(a: any[] | undefined, b: any[] | undefined): any[] {
  const seen = new Set<string>();
  return [...(a || []), ...(b || [])].filter(value => {
    const key = JSON.stringify(value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getCharacterEntries(data: UserData): UserData[] {
  return [
    ...(Array.isArray(data.lodestoneIds) ? data.lodestoneIds : []),
    ...(Array.isArray(data.customCharacters) ? data.customCharacters : [])
  ];
}

function collectContentIds(data: UserData): Record<string, string> {
  const contentIds: Record<string, string> = {};
  (Array.isArray(data.lodestoneIds) ? data.lodestoneIds : []).forEach(entry => {
    if (entry?.id !== undefined && entry.contentId) {
      contentIds[entry.id] = entry.contentId;
    }
  });
  (Array.isArray(data.customCharacters) ? data.customCharacters : []).forEach(character => {
    if (character?.ID !== undefined && character.contentId) {
      contentIds[character.ID] = character.contentId;
    }
  });
  return contentIds;
}

function stripContentId<T extends UserData>(entry: T): T {
  if (!entry || !('contentId' in entry)) {
    return entry;
  }
  const { contentId, ...rest } = entry;
  return rest as T;
}

function withContentId<T extends UserData>(entry: T, id: number | undefined, contentIds: Record<string, string>): T {
  if (!entry || id === undefined || !contentIds[id]) {
    return entry;
  }
  return { ...entry, contentId: contentIds[id] };
}
