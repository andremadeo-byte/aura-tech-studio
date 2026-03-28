'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('Utility functions', () => {
  let win;

  beforeEach(() => {
    win = loadApp().window;
  });

  // ── fd(date) ────────────────────────────────────────────────────────────────
  describe('fd(date)', () => {
    it('formats a date as YYYY-MM-DD', () => {
      const d = new Date(2025, 0, 5); // 5 Jan 2025 (months are 0-indexed)
      expect(win.fd(d)).toBe('2025-01-05');
    });

    it('zero-pads single-digit months and days', () => {
      const d = new Date(2025, 2, 9); // 9 Mar 2025
      expect(win.fd(d)).toBe('2025-03-09');
    });

    it('returns a string of length 10', () => {
      expect(win.fd(new Date())).toHaveLength(10);
    });
  });

  // ── weekDates(offset) ───────────────────────────────────────────────────────
  describe('weekDates(offset)', () => {
    it('returns exactly 7 dates', () => {
      expect(win.weekDates(0)).toHaveLength(7);
    });

    it('first day of the week is Monday (getDay() === 1)', () => {
      const dates = win.weekDates(0);
      expect(dates[0].getDay()).toBe(1);
    });

    it('last day of the week is Sunday (getDay() === 0)', () => {
      const dates = win.weekDates(0);
      expect(dates[6].getDay()).toBe(0);
    });

    it('consecutive dates differ by exactly one day', () => {
      const dates = win.weekDates(0);
      for (let i = 1; i < 7; i++) {
        const diffMs = dates[i] - dates[i - 1];
        expect(diffMs).toBe(86400000);
      }
    });

    it('offset +1 returns dates seven days later than offset 0', () => {
      const thisWeek = win.weekDates(0);
      const nextWeek = win.weekDates(1);
      const diffMs = nextWeek[0] - thisWeek[0];
      expect(diffMs).toBe(7 * 86400000);
    });

    it('offset -1 returns dates seven days earlier than offset 0', () => {
      const thisWeek = win.weekDates(0);
      const lastWeek = win.weekDates(-1);
      const diffMs = thisWeek[0] - lastWeek[0];
      expect(diffMs).toBe(7 * 86400000);
    });
  });

  // ── isThisWeek(dateString) ──────────────────────────────────────────────────
  describe('isThisWeek(dateString)', () => {
    it('returns true for today', () => {
      const today = win.fd(new Date());
      expect(win.isThisWeek(today)).toBe(true);
    });

    it('returns false for a date 14 days in the past', () => {
      const d = new Date();
      d.setDate(d.getDate() - 14);
      expect(win.isThisWeek(win.fd(d))).toBe(false);
    });

    it('returns false for a date 14 days in the future', () => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      expect(win.isThisWeek(win.fd(d))).toBe(false);
    });
  });
});
