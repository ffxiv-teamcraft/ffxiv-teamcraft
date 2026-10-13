const STATE_TTL = 10 * 60 * 1000;

export const OAUTH_STATE_ERROR = 'This authorization request is invalid or expired, please try again from Teamcraft.';

interface StoredOauthState {
  state: string;
  expires: number;
  data?: string;
}

/**
 * Creates a random OAuth `state` for a provider and remembers it, so the redirect page can check the
 * authorization comes from a flow this browser started. Stored in localStorage because the flow opens a new tab.
 * `data` is returned when the state is consumed (e.g. the team a Discord webhook is for).
 */
export function createOauthState(provider: string, data?: string): string {
  const state = Array.from(crypto.getRandomValues(new Uint8Array(24)), byte => byte.toString(16).padStart(2, '0')).join('');
  const stored: StoredOauthState = { state, data, expires: Date.now() + STATE_TTL };
  localStorage.setItem(getStorageKey(provider), JSON.stringify(stored));
  return state;
}

/**
 * Checks a `state` received on a redirect page. A matching state can only be used once.
 * A wrong state doesn't cancel the pending one, so a forged redirect can't break a real login.
 * Returns the data stored with the state, or null if it doesn't match or expired.
 */
export function consumeOauthState(provider: string, state: string | undefined): { data?: string } | null {
  const key = getStorageKey(provider);
  let stored: StoredOauthState | null;
  try {
    stored = JSON.parse(localStorage.getItem(key));
  } catch {
    stored = null;
  }
  if (!stored || stored.expires < Date.now()) {
    localStorage.removeItem(key);
    return null;
  }
  if (!state || stored.state !== state) {
    return null;
  }
  localStorage.removeItem(key);
  return { data: stored.data };
}

function getStorageKey(provider: string): string {
  return `oauth-state:${provider}`;
}
