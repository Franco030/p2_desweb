const KEY = 'tt_token';

export default class TokenStorage {
  static get() {
    try {
      return sessionStorage.getItem(KEY);
    } catch {
      return null;
    }
  }

  static set(token) {
    sessionStorage.setItem(KEY, token);
  }

  static clear() {
    sessionStorage.removeItem(KEY);
  }
}
