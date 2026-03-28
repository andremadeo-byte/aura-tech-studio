'use strict';

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, '../../aura_techh_studio.html');
const htmlContent = fs.readFileSync(HTML_PATH, 'utf8');

/**
 * Create a fresh JSDOM instance with the full application loaded.
 *
 * @param {object} [opts]
 * @param {string}  [opts.apiKey='sk-ant-api03-test'] – pre-loaded API key
 * @param {number}  [opts.followers=0]
 * @param {number}  [opts.videos=0]
 * @param {Array}   [opts.queue=[]]
 * @param {Array}   [opts.income=[]]
 * @param {Function} [opts.fetchMock] – jest.fn() to replace window.fetch
 * @returns {JSDOM}
 */
function loadApp(opts = {}) {
  const {
    apiKey = 'sk-ant-api03-test',
    followers = 0,
    videos = 0,
    queue = [],
    income = [],
    fetchMock = null,
  } = opts;

  const dom = new JSDOM(htmlContent, {
    runScripts: 'dangerously',
    url: 'http://localhost',
    beforeParse(win) {
      // Pre-populate localStorage so the app initialises with known state
      win.localStorage.setItem('at_apikey', apiKey);
      win.localStorage.setItem('at_followers', String(followers));
      win.localStorage.setItem('at_videos', String(videos));
      win.localStorage.setItem('at_queue', JSON.stringify(queue));
      win.localStorage.setItem('at_income', JSON.stringify(income));

      // Stub browser APIs that are not available in jsdom by default
      win.fetch = fetchMock || function () {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ content: [{ text: '' }] }),
        });
      };

      Object.defineProperty(win.navigator, 'clipboard', {
        value: { writeText: () => Promise.resolve() },
        configurable: true,
        writable: true,
      });

      // prompt() returns null by default (i.e. user pressed Cancel)
      win.prompt = () => null;
    },
  });

  return dom;
}

module.exports = { loadApp };
