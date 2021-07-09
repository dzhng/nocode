import '@testing-library/jest-dom';
import 'isomorphic-unfetch';
import 'jest-ts-auto-mock';

// Mocks the Fullscreen API. This is needed for ToggleFullScreenButton.test.tsx.
// Guard in if statement for any tests that specifies node environment (e.g. firebase)
// TODO: just move this to local file, currently fails test for some reason
if (global.document) {
  Object.defineProperty(document, 'fullscreenEnabled', { value: true, writable: true });
}

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
