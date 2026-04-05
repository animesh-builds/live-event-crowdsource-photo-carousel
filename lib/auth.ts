// =============================================================================
// Client-side Password Gate
// =============================================================================
// Simple scraper prevention. Not security — just privacy from casual access.
// Uses localStorage with in-memory fallback for private browsing.
// Auth expires after 24 hours — user must re-enter password.
// =============================================================================

const AUTH_KEY = 'epc_auth_v1';
const AUTH_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

let sessionAuthAt = 0;

export function isAuthenticated(): boolean {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return false;
    const authTime = parseInt(stored, 10);
    if (isNaN(authTime)) return false;
    return Date.now() - authTime < AUTH_TTL_MS;
  } catch {
    return sessionAuthAt > 0 && Date.now() - sessionAuthAt < AUTH_TTL_MS;
  }
}

export function authenticate(input: string, correctPassword: string): boolean {
  if (input.trim() === correctPassword) {
    const now = Date.now().toString();
    try {
      localStorage.setItem(AUTH_KEY, now);
    } catch {
      sessionAuthAt = Date.now();
    }
    return true;
  }
  return false;
}

export function logout(): void {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
  sessionAuthAt = 0;
}
