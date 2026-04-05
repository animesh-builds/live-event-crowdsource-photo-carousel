// =============================================================================
// Client-side Password Gate
// =============================================================================
// Simple scraper prevention. Not security — just privacy from casual access.
// Uses localStorage with in-memory fallback for private browsing.
// =============================================================================

const AUTH_KEY = 'epc_auth_v1';

let sessionAuth = false;

export function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return sessionAuth;
  }
}

export function authenticate(input: string, correctPassword: string): boolean {
  if (input.trim() === correctPassword) {
    try {
      localStorage.setItem(AUTH_KEY, 'true');
    } catch {
      sessionAuth = true;
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
  sessionAuth = false;
}
