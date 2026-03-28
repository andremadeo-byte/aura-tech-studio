'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('Calendar — renderCal()', () => {
  let dom, win, doc;

  beforeEach(() => {
    dom = loadApp();
    win = dom.window;
    doc = win.document;
    win.nav('schedule');
  });

  it('renders exactly 7 day columns', () => {
    const days = doc.querySelectorAll('#cal .cal-day');
    expect(days.length).toBe(7);
  });

  it('marks today with the "today" CSS class', () => {
    const todayDays = doc.querySelectorAll('#cal .cal-day.today');
    expect(todayDays.length).toBe(1);
  });

  it('each day column contains exactly 3 time slots', () => {
    const days = doc.querySelectorAll('#cal .cal-day');
    days.forEach(day => {
      expect(day.querySelectorAll('.slot').length).toBe(3);
    });
  });

  it('week label shows a date range string', () => {
    const label = doc.getElementById('week-lbl').textContent;
    expect(label).toMatch(/\d+/); // contains at least one number
  });

  it('displays "0" scheduled items in the stat card when queue is empty', () => {
    expect(doc.getElementById('sched-n').textContent).toBe('0');
  });

  it('counts only this week\'s items in the scheduled stat', () => {
    const dates = win.weekDates(0);
    const dateStr = win.fd(dates[2]); // Wednesday of this week
    const queue = [
      { id: 1, topic: 'In week', script: '', caption: '', date: dateStr, time: '07:00', status: 'scheduled', ctype: 'curiosity' },
      { id: 2, topic: 'Far future', script: '', caption: '', date: '2099-12-31', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
    ];
    const win2 = loadApp({ queue }).window;
    win2.nav('schedule');
    expect(win2.document.getElementById('sched-n').textContent).toBe('1');
  });

  it('a scheduled item appears in the correct day slot', () => {
    const dates = win.weekDates(0);
    const dateStr = win.fd(dates[0]); // Monday
    const queue = [
      { id: 3, topic: 'Monday post', script: '', caption: '', date: dateStr, time: '07:00', status: 'scheduled', ctype: 'curiosity' },
    ];
    const win2 = loadApp({ queue }).window;
    win2.nav('schedule');
    const calGrid = win2.document.getElementById('cal');
    expect(calGrid.textContent).toContain('Monday post');
  });

  it('posted items are marked with a check in the slot', () => {
    const dates = win.weekDates(0);
    const dateStr = win.fd(dates[0]);
    const queue = [
      { id: 4, topic: 'Posted post', script: '', caption: '', date: dateStr, time: '07:00', status: 'posted', ctype: 'curiosity' },
    ];
    const win2 = loadApp({ queue }).window;
    win2.nav('schedule');
    expect(win2.document.getElementById('cal').textContent).toContain('✓');
  });

  it('prevW() moves the calendar to the previous week', () => {
    const initialLabel = doc.getElementById('week-lbl').textContent;
    win.prevW();
    const newLabel = doc.getElementById('week-lbl').textContent;
    expect(newLabel).not.toBe(initialLabel);
  });

  it('nextW() moves the calendar to the next week', () => {
    const initialLabel = doc.getElementById('week-lbl').textContent;
    win.nextW();
    const newLabel = doc.getElementById('week-lbl').textContent;
    expect(newLabel).not.toBe(initialLabel);
  });

  it('prevW() then nextW() returns to the original week', () => {
    const initialLabel = doc.getElementById('week-lbl').textContent;
    win.prevW();
    win.nextW();
    expect(doc.getElementById('week-lbl').textContent).toBe(initialLabel);
  });
});

describe('Full queue rendering — renderFullQueue()', () => {
  it('shows the empty-state element when queue is empty', () => {
    const dom = loadApp();
    dom.window.nav('schedule');
    const el = dom.window.document.getElementById('full-queue');
    expect(el.querySelector('.empty')).not.toBeNull();
  });

  it('renders all queue items sorted by date/time', () => {
    const queue = [
      { id: 10, topic: 'Second item', script: '', caption: '', date: '2099-06-02', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
      { id: 11, topic: 'First item', script: '', caption: '', date: '2099-06-01', time: '07:00', status: 'scheduled', ctype: 'curiosity' },
    ];
    const win = loadApp({ queue }).window;
    win.nav('schedule');
    const items = win.document.querySelectorAll('#full-queue .qitem');
    expect(items.length).toBe(2);
    // First rendered item should be "First item"
    expect(items[0].textContent).toContain('First item');
    expect(items[1].textContent).toContain('Second item');
  });

  it('shows "Posted ✓" badge for posted items', () => {
    const queue = [
      { id: 20, topic: 'Done', script: '', caption: '', date: '2099-01-01', time: '07:00', status: 'posted', ctype: 'curiosity' },
    ];
    const win = loadApp({ queue }).window;
    win.nav('schedule');
    expect(win.document.getElementById('full-queue').textContent).toContain('Posted ✓');
  });
});
