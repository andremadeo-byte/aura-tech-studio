'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('ROI calculator — calcROI()', () => {
  let dom, win, doc;

  beforeEach(() => {
    dom = loadApp();
    win = dom.window;
    doc = win.document;
    win.nav('ads');
  });

  function setROIInputs({ spend = 50, cpc = 0.12, conv = 4, comm = 20 } = {}) {
    doc.getElementById('roi-spend').value = spend;
    doc.getElementById('roi-cpc').value = cpc;
    doc.getElementById('roi-conv').value = conv;
    doc.getElementById('roi-comm').value = comm;
    win.calcROI();
  }

  it('calculates clicks = Math.round(spend / cpc)', () => {
    setROIInputs({ spend: 100, cpc: 0.10 });
    expect(doc.getElementById('roi-clicks').textContent).toBe('1,000');
  });

  it('calculates revenue = Math.round(clicks × conv/100 × commission)', () => {
    // clicks = round(100/0.10) = 1000; rev = round(1000 * 0.05 * 30) = 1500
    setROIInputs({ spend: 100, cpc: 0.10, conv: 5, comm: 30 });
    expect(doc.getElementById('roi-rev').textContent).toBe('£1500');
  });

  it('net = revenue − spend', () => {
    // spend=100, cpc=0.10 → clicks=1000; conv=5%, comm=30 → rev=1500; net=1400
    setROIInputs({ spend: 100, cpc: 0.10, conv: 5, comm: 30 });
    expect(doc.getElementById('roi-net').textContent).toBe('£1400');
  });

  it('colours the net value green when the campaign is profitable', () => {
    setROIInputs({ spend: 50, cpc: 0.10, conv: 5, comm: 30 });
    expect(doc.getElementById('roi-net').style.color).toBe('var(--green)');
  });

  it('colours the net value red when the campaign loses money', () => {
    // Very low conversion so revenue < spend
    setROIInputs({ spend: 1000, cpc: 10, conv: 0, comm: 1 });
    expect(doc.getElementById('roi-net').style.color).toBe('var(--red)');
  });

  it('net is zero when revenue equals spend and colour is green', () => {
    // clicks = round(100/10) = 10; conv=100% → rev = round(10 * 1 * 10) = 100; net = 100 - 100 = 0
    setROIInputs({ spend: 100, cpc: 10, conv: 100, comm: 10 });
    expect(doc.getElementById('roi-net').textContent).toBe('£0');
    expect(doc.getElementById('roi-net').style.color).toBe('var(--green)');
  });

  it('handles default values without throwing', () => {
    // calcROI reads from inputs which default to placeholder values
    expect(() => win.calcROI()).not.toThrow();
  });

  it('roi-clicks uses locale formatting for large numbers', () => {
    setROIInputs({ spend: 1000, cpc: 0.01, conv: 1, comm: 10 });
    // clicks = round(1000/0.01) = 100000
    expect(doc.getElementById('roi-clicks').textContent).toBe('100,000');
  });
});
