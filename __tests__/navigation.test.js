'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('Navigation', () => {
  let dom, win, doc;

  beforeEach(() => {
    dom = loadApp();
    win = dom.window;
    doc = win.document;
  });

  it('dashboard page is active by default', () => {
    expect(doc.getElementById('pg-dashboard').classList.contains('active')).toBe(true);
  });

  it('other pages are hidden on load', () => {
    ['create', 'schedule', 'earnings', 'ads', 'plan', 'trends'].forEach(id => {
      expect(doc.getElementById('pg-' + id).classList.contains('active')).toBe(false);
    });
  });

  it('nav("create") makes the create page active', () => {
    win.nav('create');
    expect(doc.getElementById('pg-create').classList.contains('active')).toBe(true);
  });

  it('nav("create") deactivates the dashboard page', () => {
    win.nav('create');
    expect(doc.getElementById('pg-dashboard').classList.contains('active')).toBe(false);
  });

  it('nav("schedule") makes the schedule page active', () => {
    win.nav('schedule');
    expect(doc.getElementById('pg-schedule').classList.contains('active')).toBe(true);
  });

  it('nav("earnings") makes the earnings page active', () => {
    win.nav('earnings');
    expect(doc.getElementById('pg-earnings').classList.contains('active')).toBe(true);
  });

  it('nav("ads") makes the ads page active', () => {
    win.nav('ads');
    expect(doc.getElementById('pg-ads').classList.contains('active')).toBe(true);
  });

  it('nav("plan") makes the plan page active', () => {
    win.nav('plan');
    expect(doc.getElementById('pg-plan').classList.contains('active')).toBe(true);
  });

  it('nav("trends") makes the trends page active', () => {
    win.nav('trends');
    expect(doc.getElementById('pg-trends').classList.contains('active')).toBe(true);
  });

  it('only one page is active at a time', () => {
    win.nav('earnings');
    const active = doc.querySelectorAll('.page.active');
    expect(active.length).toBe(1);
  });

  it('the matching nav button gets the active class', () => {
    win.nav('create');
    const activeBtn = doc.querySelector('.nav-btn.active');
    expect(activeBtn).not.toBeNull();
    expect(activeBtn.getAttribute('onclick')).toBe("nav('create')");
  });

  it('navigating back to dashboard marks the dashboard nav button active', () => {
    win.nav('schedule');
    win.nav('dashboard');
    const activeBtn = doc.querySelector('.nav-btn.active');
    expect(activeBtn.getAttribute('onclick')).toBe("nav('dashboard')");
  });
});
