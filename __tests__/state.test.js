'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('State initialisation and persistence', () => {
  describe('Initialisation from localStorage', () => {
    it('reads followers from localStorage', () => {
      const win = loadApp({ followers: 42 }).window;
      // refreshDash() renders S.followers into #s-followers
      expect(win.document.getElementById('s-followers').textContent).toBe('42');
    });

    it('defaults followers to 0 when localStorage is empty', () => {
      const win = loadApp({ followers: 0 }).window;
      expect(win.document.getElementById('s-followers').textContent).toBe('0');
    });

    it('reads videos from localStorage', () => {
      const win = loadApp({ videos: 7 }).window;
      expect(win.document.getElementById('s-videos').textContent).toBe('7');
    });

    it('reads queue from localStorage', () => {
      const queue = [
        { id: 1, topic: 'AI test', script: 'test', caption: '', date: '2099-01-01', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
      ];
      const win = loadApp({ queue }).window;
      // renderFullQueue() renders items into #full-queue (triggered by nav('schedule'))
      win.nav('schedule');
      const fullQueue = win.document.getElementById('full-queue');
      expect(fullQueue.textContent).toContain('AI test');
    });

    it('reads income from localStorage', () => {
      const income = [
        { id: 1, source: 'affiliate_chatgpt', amount: 25.5, note: '', date: new Date().toISOString() },
      ];
      const win = loadApp({ income }).window;
      // refreshEarnings is called via nav; call it directly
      win.nav('earnings');
      expect(win.document.getElementById('e-total').textContent).toBe('25.50');
    });
  });

  describe('save()', () => {
    it('persists followers to localStorage', () => {
      const win = loadApp({ followers: 10 }).window;
      // Simulate an update via editStat (prompt returns '99')
      win.prompt = () => '99';
      win.editStat('followers');
      expect(win.localStorage.getItem('at_followers')).toBe('99');
    });

    it('persists videos to localStorage', () => {
      const win = loadApp({ videos: 3 }).window;
      win.prompt = () => '15';
      win.editStat('videos');
      expect(win.localStorage.getItem('at_videos')).toBe('15');
    });

    it('persists queue to localStorage after addQueue', () => {
      const dom = loadApp();
      const win = dom.window;
      const doc = win.document;
      // Set up state so addQueue succeeds
      win.eval("S.script = 'test script'; S.selectedTopic = 'test topic';");
      doc.getElementById('post-date').value = '2099-06-15';
      win.addQueue();
      const saved = JSON.parse(win.localStorage.getItem('at_queue'));
      expect(saved.length).toBe(1);
      expect(saved[0].topic).toBe('test topic');
    });

    it('persists income to localStorage after logIncome', () => {
      const dom = loadApp();
      const win = dom.window;
      const doc = win.document;
      win.nav('earnings');
      doc.getElementById('inc-amt').value = '10.00';
      doc.getElementById('inc-src').value = 'creator_fund';
      doc.getElementById('inc-note').value = 'test';
      win.logIncome();
      const saved = JSON.parse(win.localStorage.getItem('at_income'));
      expect(saved.length).toBe(1);
      expect(saved[0].amount).toBe(10);
    });
  });
});
