'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('API key management', () => {
  describe('getKey / saveKey', () => {
    it('getKey() returns empty string when no key is saved', () => {
      const win = loadApp({ apiKey: '' }).window;
      expect(win.getKey()).toBe('');
    });

    it('getKey() returns the stored API key', () => {
      const win = loadApp({ apiKey: 'sk-ant-api03-mykey' }).window;
      expect(win.getKey()).toBe('sk-ant-api03-mykey');
    });

    it('saveKey(k) persists the key to localStorage', () => {
      const win = loadApp().window;
      win.saveKey('sk-ant-api03-newkey');
      expect(win.localStorage.getItem('at_apikey')).toBe('sk-ant-api03-newkey');
    });

    it('saveKey(k) makes getKey() return the new key', () => {
      const win = loadApp().window;
      win.saveKey('sk-ant-api03-updated');
      expect(win.getKey()).toBe('sk-ant-api03-updated');
    });
  });

  describe('showKeyScreen / hideKeyScreen', () => {
    it('showKeyScreen() makes the key screen visible', () => {
      const dom = loadApp({ apiKey: 'sk-ant-api03-test' });
      const win = dom.window;
      const doc = win.document;
      win.showKeyScreen();
      expect(doc.getElementById('key-screen').style.display).toBe('flex');
    });

    it('hideKeyScreen() hides the key screen', () => {
      const dom = loadApp();
      const win = dom.window;
      const doc = win.document;
      win.showKeyScreen();
      win.hideKeyScreen();
      expect(doc.getElementById('key-screen').style.display).toBe('none');
    });

    it('showKeyScreen() pre-fills the key input with the current key', () => {
      const dom = loadApp({ apiKey: 'sk-ant-api03-prefill' });
      const win = dom.window;
      const doc = win.document;
      win.showKeyScreen();
      expect(doc.getElementById('key-input').value).toBe('sk-ant-api03-prefill');
    });
  });

  describe('submitKey()', () => {
    it('saves a valid key (starts with sk-ant-) and hides the screen', () => {
      const dom = loadApp({ apiKey: '' });
      const win = dom.window;
      const doc = win.document;
      doc.getElementById('key-input').value = 'sk-ant-api03-valid123';
      win.submitKey();
      expect(win.getKey()).toBe('sk-ant-api03-valid123');
      expect(doc.getElementById('key-screen').style.display).toBe('none');
    });

    it('shows a toast and does NOT save an invalid key', () => {
      const dom = loadApp({ apiKey: '' });
      const win = dom.window;
      const doc = win.document;
      doc.getElementById('key-input').value = 'invalid-key-format';
      win.submitKey();
      // Key should remain empty
      expect(win.getKey()).toBe('');
      // Toast should be visible
      expect(doc.getElementById('toast').classList.contains('show')).toBe(true);
    });

    it('rejects a blank key', () => {
      const dom = loadApp({ apiKey: '' });
      const win = dom.window;
      const doc = win.document;
      doc.getElementById('key-input').value = '';
      win.submitKey();
      expect(win.getKey()).toBe('');
      expect(doc.getElementById('toast').classList.contains('show')).toBe(true);
    });

    it('accepts a key that starts with "sk-ant-" but has more content', () => {
      const dom = loadApp({ apiKey: '' });
      const win = dom.window;
      const doc = win.document;
      doc.getElementById('key-input').value = 'sk-ant-api03-abc123-extra';
      win.submitKey();
      expect(win.getKey()).toBe('sk-ant-api03-abc123-extra');
    });
  });

  describe('Initial key screen behaviour', () => {
    it('key screen is shown automatically when no key is stored', () => {
      const dom = loadApp({ apiKey: '' });
      const doc = dom.window.document;
      expect(doc.getElementById('key-screen').style.display).toBe('flex');
    });

    it('key screen is NOT shown when a key is already stored', () => {
      const dom = loadApp({ apiKey: 'sk-ant-api03-present' });
      const doc = dom.window.document;
      expect(doc.getElementById('key-screen').style.display).not.toBe('flex');
    });
  });
});
