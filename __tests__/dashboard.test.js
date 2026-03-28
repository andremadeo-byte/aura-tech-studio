'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('Dashboard — refreshDash()', () => {
  it('renders the follower count', () => {
    const win = loadApp({ followers: 1500 }).window;
    expect(win.document.getElementById('s-followers').textContent).toBe('1,500');
  });

  it('renders the video count', () => {
    const win = loadApp({ videos: 12 }).window;
    expect(win.document.getElementById('s-videos').textContent).toBe('12');
  });

  it('renders total earned from income sum', () => {
    const income = [
      { id: 1, source: 'creator_fund', amount: 30, note: '', date: new Date().toISOString() },
      { id: 2, source: 'brand_deal', amount: 20, note: '', date: new Date().toISOString() },
    ];
    const win = loadApp({ income }).window;
    expect(win.document.getElementById('s-earned').textContent).toBe('50');
  });

  it('renders £0 earned when no income exists', () => {
    const win = loadApp().window;
    expect(win.document.getElementById('s-earned').textContent).toBe('0');
  });

  it('ad budget = 30% of (total − £19) rounded down', () => {
    const income = [
      { id: 1, source: 'creator_fund', amount: 119, note: '', date: new Date().toISOString() },
    ];
    const win = loadApp({ income }).window;
    // profit = 119 - 19 = 100; ad budget = 30
    expect(win.document.getElementById('s-adbudget').textContent).toBe('30');
  });

  it('ad budget is £0 when total income ≤ £19 (no profit yet)', () => {
    const income = [
      { id: 1, source: 'creator_fund', amount: 10, note: '', date: new Date().toISOString() },
    ];
    const win = loadApp({ income }).window;
    expect(win.document.getElementById('s-adbudget').textContent).toBe('0');
  });

  it('follower progress bar width reflects percentage of 1000-follower target', () => {
    const win = loadApp({ followers: 500 }).window;
    const bar = win.document.getElementById('fl-bar');
    expect(bar.style.width).toBe('50%');
  });

  it('follower progress bar is capped at 100% when target is exceeded', () => {
    const win = loadApp({ followers: 2000 }).window;
    const bar = win.document.getElementById('fl-bar');
    expect(bar.style.width).toBe('100%');
  });

  it('follower progress label shows "X / 1,000"', () => {
    const win = loadApp({ followers: 250 }).window;
    expect(win.document.getElementById('fl-lbl').textContent).toBe('250 / 1,000');
  });

  it('shows empty queue state when no videos are scheduled in next 24h', () => {
    const win = loadApp().window;
    const queue = win.document.getElementById('dash-queue');
    expect(queue.querySelector('.empty')).not.toBeNull();
  });

  it('shows upcoming videos scheduled within the next 24 hours', () => {
    // Find the next upcoming fixed slot (07:00, 12:00, or 19:00) relative to now
    const fmt = d => d.toISOString().split('T')[0];
    const now = new Date();
    const h = now.getHours() * 60 + now.getMinutes();
    let slotDate, slotTime;
    if (h < 7 * 60) {
      slotDate = fmt(now);
      slotTime = '07:00';
    } else if (h < 12 * 60) {
      slotDate = fmt(now);
      slotTime = '12:00';
    } else if (h < 19 * 60) {
      slotDate = fmt(now);
      slotTime = '19:00';
    } else {
      // All today's slots are past — use tomorrow 07:00 (always within 24h)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      slotDate = fmt(tomorrow);
      slotTime = '07:00';
    }
    const queue = [
      { id: 1, topic: 'Upcoming AI video', script: 'x', caption: '', date: slotDate, time: slotTime, status: 'scheduled', ctype: 'curiosity' },
    ];
    const win2 = loadApp({ queue }).window;
    const dashQueue = win2.document.getElementById('dash-queue');
    expect(dashQueue.textContent).toContain('Upcoming AI video');
  });

  it('editStat updates followers when prompt returns a valid number', () => {
    const win = loadApp({ followers: 0 }).window;
    win.prompt = () => '300';
    win.editStat('followers');
    expect(win.document.getElementById('s-followers').textContent).toBe('300');
  });

  it('editStat does nothing when prompt is cancelled (returns null)', () => {
    const win = loadApp({ followers: 10 }).window;
    win.prompt = () => null;
    win.editStat('followers');
    expect(win.document.getElementById('s-followers').textContent).toBe('10');
  });

  it('editStat does nothing when an invalid (non-numeric) value is entered', () => {
    const win = loadApp({ followers: 10 }).window;
    win.prompt = () => 'abc';
    win.editStat('followers');
    // isNaN('abc') is true so the update should be skipped
    expect(win.document.getElementById('s-followers').textContent).toBe('10');
  });
});
