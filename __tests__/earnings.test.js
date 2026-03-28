'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('Earnings', () => {
  // ── logIncome() ─────────────────────────────────────────────────────────────
  describe('logIncome()', () => {
    let dom, win, doc;
    beforeEach(() => {
      dom = loadApp();
      win = dom.window;
      doc = win.document;
      win.nav('earnings');
    });

    it('shows a toast when amount is 0', () => {
      doc.getElementById('inc-amt').value = '0';
      win.logIncome();
      expect(doc.getElementById('toast').textContent).toContain('valid amount');
    });

    it('shows a toast when amount is negative', () => {
      doc.getElementById('inc-amt').value = '-5';
      win.logIncome();
      expect(doc.getElementById('toast').textContent).toContain('valid amount');
    });

    it('shows a toast when amount input is empty', () => {
      doc.getElementById('inc-amt').value = '';
      win.logIncome();
      expect(doc.getElementById('toast').textContent).toContain('valid amount');
    });

    it('adds an income entry when amount is valid', () => {
      doc.getElementById('inc-amt').value = '15.00';
      doc.getElementById('inc-src').value = 'creator_fund';
      doc.getElementById('inc-note').value = 'week 1';
      win.logIncome();
      const income = JSON.parse(win.localStorage.getItem('at_income'));
      expect(income.length).toBe(1);
      expect(income[0].amount).toBe(15);
    });

    it('saved entry carries source and note', () => {
      doc.getElementById('inc-amt').value = '20';
      doc.getElementById('inc-src').value = 'affiliate_chatgpt';
      doc.getElementById('inc-note').value = 'referral bonus';
      win.logIncome();
      const entry = JSON.parse(win.localStorage.getItem('at_income'))[0];
      expect(entry.source).toBe('affiliate_chatgpt');
      expect(entry.note).toBe('referral bonus');
    });

    it('clears the amount input after logging', () => {
      doc.getElementById('inc-amt').value = '10';
      win.logIncome();
      expect(doc.getElementById('inc-amt').value).toBe('');
    });

    it('shows a success toast after logging', () => {
      doc.getElementById('inc-amt').value = '5.50';
      win.logIncome();
      expect(doc.getElementById('toast').textContent).toContain('Logged');
    });
  });

  // ── removeInc(id) ───────────────────────────────────────────────────────────
  describe('removeInc(id)', () => {
    it('removes the income entry with the given id', () => {
      const income = [
        { id: 10, source: 'creator_fund', amount: 5, note: '', date: new Date().toISOString() },
        { id: 11, source: 'brand_deal', amount: 50, note: '', date: new Date().toISOString() },
      ];
      const win = loadApp({ income }).window;
      win.nav('earnings');
      win.removeInc(10);
      const saved = JSON.parse(win.localStorage.getItem('at_income'));
      expect(saved.length).toBe(1);
      expect(saved[0].id).toBe(11);
    });
  });

  // ── refreshEarnings() ───────────────────────────────────────────────────────
  describe('refreshEarnings()', () => {
    it('displays the correct total across multiple income entries', () => {
      const income = [
        { id: 1, source: 'creator_fund', amount: 10, note: '', date: new Date().toISOString() },
        { id: 2, source: 'brand_deal', amount: 15.5, note: '', date: new Date().toISOString() },
      ];
      const win = loadApp({ income }).window;
      win.nav('earnings');
      expect(win.document.getElementById('e-total').textContent).toBe('25.50');
    });

    it('displays profit = total − £19 running costs', () => {
      const income = [
        { id: 1, source: 'creator_fund', amount: 50, note: '', date: new Date().toISOString() },
      ];
      const win = loadApp({ income }).window;
      win.nav('earnings');
      expect(win.document.getElementById('e-profit').textContent).toBe('31.00');
    });

    it('profit cannot be negative (clamped to 0)', () => {
      const income = [
        { id: 1, source: 'creator_fund', amount: 5, note: '', date: new Date().toISOString() },
      ];
      const win = loadApp({ income }).window;
      win.nav('earnings');
      expect(win.document.getElementById('e-profit').textContent).toBe('0.00');
    });

    it('ad budget = 30% of profit', () => {
      const income = [
        { id: 1, source: 'creator_fund', amount: 119, note: '', date: new Date().toISOString() },
      ];
      const win = loadApp({ income }).window;
      win.nav('earnings');
      // profit = 119 - 19 = 100 → ad budget = 30
      expect(win.document.getElementById('e-adbudget').textContent).toBe('30.00');
    });

    it('shows zero totals when there is no income', () => {
      const win = loadApp().window;
      win.nav('earnings');
      expect(win.document.getElementById('e-total').textContent).toBe('0.00');
      expect(win.document.getElementById('e-profit').textContent).toBe('0.00');
    });

    it('renders income history entries in the DOM', () => {
      const income = [
        { id: 1, source: 'creator_fund', amount: 8, note: 'test', date: new Date().toISOString() },
      ];
      const win = loadApp({ income }).window;
      win.nav('earnings');
      const hist = win.document.getElementById('inc-history');
      expect(hist.textContent).toContain('8.00');
    });

    it('renders empty state when no income exists', () => {
      const win = loadApp().window;
      win.nav('earnings');
      const hist = win.document.getElementById('inc-history');
      expect(hist.querySelector('.empty')).not.toBeNull();
    });
  });
});
