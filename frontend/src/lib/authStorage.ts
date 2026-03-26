const TOKEN_KEY = 'nexa_auth_token';
const USER_KEY = 'nexa_auth_user';
const TOKEN_STORAGE_KEY = 'nexa_auth_tokens';
const LEGACY_USER_KEY = 'nexa_user';

const storage = () => sessionStorage;

export const authStorage = {
  getToken(): string | null {
    return storage().getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    storage().setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    storage().removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): string | null {
    return storage().getItem(USER_KEY);
  },

  setUser(user: string): void {
    storage().setItem(USER_KEY, user);
  },

  removeUser(): void {
    storage().removeItem(USER_KEY);
    storage().removeItem(LEGACY_USER_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
  },

  getTokens(): string | null {
    return storage().getItem(TOKEN_STORAGE_KEY);
  },

  setTokens(tokens: string): void {
    storage().setItem(TOKEN_STORAGE_KEY, tokens);
  },

  removeTokens(): void {
    storage().removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },
};
