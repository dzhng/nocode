import '@testing-library/jest-dom';
import 'isomorphic-unfetch';
import 'jest-ts-auto-mock';

if (global.window) {
  class LocalStorage {
    store = {} as { [key: string]: string };

    getItem(key: string) {
      return this.store[key];
    }

    setItem(key: string, value: string) {
      this.store[key] = value;
    }

    clear() {
      this.store = {} as { [key: string]: string };
    }
  }

  Object.defineProperty(window, 'localStorage', { value: new LocalStorage() });
}
