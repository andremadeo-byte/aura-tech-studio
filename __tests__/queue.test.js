'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('Queue operations', () => {
  let dom, win, doc;

  beforeEach(() => {
    dom = loadApp();
    win = dom.window;
    doc = win.document;
  });

  // ── addQueue() ──────────────────────────────────────────────────────────────
  describe('addQueue()', () => {
    it('shows a toast warning when no script has been generated', () => {
      // S.script is '' on fresh load
      win.addQueue();
      expect(doc.getElementById('toast').textContent).toContain('Generate a script');
    });

    it('does NOT add to the queue when no script is set', () => {
      win.addQueue();
      const queue = JSON.parse(win.localStorage.getItem('at_queue') || '[]');
      expect(queue.length).toBe(0);
    });

    it('shows a toast warning when a date is missing', () => {
      win.eval("S.script = 'test script'; S.selectedTopic = 'test topic';");
      // Leave the date input empty
      doc.getElementById('post-date').value = '';
      win.addQueue();
      expect(doc.getElementById('toast').textContent).toContain('Pick a date');
    });

    it('adds an item to the queue when script and date are set', () => {
      win.eval("S.script = 'test script'; S.selectedTopic = 'test topic'; S.selectedCtype = 'curiosity'; S.caption = 'test caption';");
      doc.getElementById('post-date').value = '2099-12-01';
      doc.getElementById('post-time').value = '12:00';
      win.addQueue();
      const queue = JSON.parse(win.localStorage.getItem('at_queue'));
      expect(queue.length).toBe(1);
    });

    it('saved queue item has the expected properties', () => {
      win.eval("S.script = 'my script'; S.selectedTopic = 'AI news'; S.selectedCtype = 'breaking'; S.caption = 'cap';");
      doc.getElementById('post-date').value = '2099-03-10';
      doc.getElementById('post-time').value = '19:00';
      win.addQueue();
      const item = JSON.parse(win.localStorage.getItem('at_queue'))[0];
      expect(item.topic).toBe('AI news');
      expect(item.date).toBe('2099-03-10');
      expect(item.time).toBe('19:00');
      expect(item.status).toBe('scheduled');
      expect(item.ctype).toBe('breaking');
      expect(typeof item.id).toBe('number');
    });

    it('shows a success toast after adding to queue', () => {
      win.eval("S.script = 'test script'; S.selectedTopic = 'test topic'; S.caption = '';");
      doc.getElementById('post-date').value = '2099-01-01';
      win.addQueue();
      expect(doc.getElementById('toast').textContent).toContain('Added to schedule');
    });
  });

  // ── removeQ(id) ─────────────────────────────────────────────────────────────
  describe('removeQ(id)', () => {
    it('removes an item from the queue by id', () => {
      const initialQueue = [
        { id: 100, topic: 'Topic A', script: 'x', caption: '', date: '2099-01-01', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
        { id: 101, topic: 'Topic B', script: 'y', caption: '', date: '2099-01-02', time: '12:00', status: 'scheduled', ctype: 'breaking' },
      ];
      const win2 = loadApp({ queue: initialQueue }).window;
      win2.removeQ(100);
      const queue = JSON.parse(win2.localStorage.getItem('at_queue'));
      expect(queue.length).toBe(1);
      expect(queue[0].id).toBe(101);
    });

    it('does nothing when the id does not exist', () => {
      const initialQueue = [
        { id: 200, topic: 'Keep me', script: '', caption: '', date: '2099-01-01', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
      ];
      const win2 = loadApp({ queue: initialQueue }).window;
      win2.removeQ(999);
      const queue = JSON.parse(win2.localStorage.getItem('at_queue'));
      expect(queue.length).toBe(1);
    });
  });

  // ── markPosted(id) ──────────────────────────────────────────────────────────
  describe('markPosted(id)', () => {
    it('sets the item status to "posted"', () => {
      const initialQueue = [
        { id: 300, topic: 'Post me', script: '', caption: '', date: '2099-01-01', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
      ];
      const win2 = loadApp({ queue: initialQueue }).window;
      win2.markPosted(300);
      const queue = JSON.parse(win2.localStorage.getItem('at_queue'));
      expect(queue[0].status).toBe('posted');
    });

    it('increments the video count', () => {
      const initialQueue = [
        { id: 301, topic: 'Count me', script: '', caption: '', date: '2099-01-01', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
      ];
      const win2 = loadApp({ queue: initialQueue, videos: 5 }).window;
      win2.markPosted(301);
      expect(win2.localStorage.getItem('at_videos')).toBe('6');
    });

    it('shows a posted toast', () => {
      const initialQueue = [
        { id: 302, topic: 'Toast me', script: '', caption: '', date: '2099-01-01', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
      ];
      const win2 = loadApp({ queue: initialQueue }).window;
      win2.markPosted(302);
      expect(win2.document.getElementById('toast').textContent).toContain('Posted');
    });

    it('does nothing when the id does not exist', () => {
      const win2 = loadApp({ videos: 3 }).window;
      win2.markPosted(9999);
      expect(win2.localStorage.getItem('at_videos')).toBe('3');
    });
  });
});
