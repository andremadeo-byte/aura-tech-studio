'use strict';

const { loadApp } = require('./helpers/loadApp');

describe('Content type selection — selCtype()', () => {
  let dom, win, doc;

  beforeEach(() => {
    dom = loadApp();
    win = dom.window;
    doc = win.document;
  });

  it('element at the selected index gains the "sel" class', () => {
    win.selCtype(2, 'scary', '😱 Scary AI Truth', 'Unsettling facts');
    expect(doc.getElementById('ct-2').classList.contains('sel')).toBe(true);
  });

  it('previously selected element loses the "sel" class', () => {
    // ct-0 is selected by default
    win.selCtype(1, 'breaking', 'Breaking', 'desc');
    expect(doc.getElementById('ct-0').classList.contains('sel')).toBe(false);
  });

  it('only one content-type card is selected at a time', () => {
    win.selCtype(3, 'tool', 'Tool', 'desc');
    const selected = doc.querySelectorAll('.ctype.sel');
    expect(selected.length).toBe(1);
  });

  it('default selected type is "curiosity" (index 0)', () => {
    expect(doc.getElementById('ct-0').classList.contains('sel')).toBe(true);
  });

  it.each([
    [0, 'curiosity'],
    [1, 'breaking'],
    [2, 'scary'],
    [3, 'tool'],
    [4, 'future'],
    [5, 'myth'],
  ])('selCtype(%i, "%s") makes ct-%i active', (idx, val) => {
    win.selCtype(idx, val, 'Name', 'Desc');
    expect(doc.getElementById('ct-' + idx).classList.contains('sel')).toBe(true);
  });
});

describe('Hook selection — selHook()', () => {
  let dom, win, doc;

  beforeEach(() => {
    dom = loadApp();
    win = dom.window;
    doc = win.document;
    // Manually inject hook items into the DOM (normally created by genHooks())
    doc.getElementById('hooks-area').innerHTML = [
      '<div class="topic-item" id="h-0"><span class="tn">1</span><span class="tt">Hook one</span></div>',
      '<div class="topic-item" id="h-1"><span class="tn">2</span><span class="tt">Hook two</span></div>',
      '<div class="topic-item" id="h-2"><span class="tn">3</span><span class="tt">Hook three</span></div>',
    ].join('');
  });

  it('updates the selected-preview text with the chosen hook', () => {
    win.selHook('Hook one', 0);
    expect(doc.getElementById('sel-preview').textContent).toContain('Hook one');
  });

  it('the selected hook item gains the "sel" class', () => {
    win.selHook('Hook two', 1);
    expect(doc.getElementById('h-1').classList.contains('sel')).toBe(true);
  });

  it('other hook items do not have the "sel" class', () => {
    win.selHook('Hook two', 1);
    expect(doc.getElementById('h-0').classList.contains('sel')).toBe(false);
    expect(doc.getElementById('h-2').classList.contains('sel')).toBe(false);
  });

  it('enables the write-script button after a hook is selected', () => {
    win.selHook('Hook three', 2);
    expect(doc.getElementById('btn-script').disabled).toBe(false);
  });

  it('switching selection moves the "sel" class to the new item', () => {
    win.selHook('Hook one', 0);
    win.selHook('Hook three', 2);
    expect(doc.getElementById('h-0').classList.contains('sel')).toBe(false);
    expect(doc.getElementById('h-2').classList.contains('sel')).toBe(true);
  });
});

describe('Ads budget allocation — refreshAds()', () => {
  let dom, win, doc;

  beforeEach(() => {
    const income = [
      { id: 1, source: 'creator_fund', amount: 119, note: '', date: new Date().toISOString() },
    ];
    dom = loadApp({ income });
    win = dom.window;
    doc = win.document;
    win.nav('ads');
  });

  it('displays the profit correctly', () => {
    // total = 119, profit = 100
    expect(doc.getElementById('ad-profit').textContent).toBe('100.00');
  });

  it('allocates 50% of the deployable budget to TikTok TopFeed', () => {
    // reinvest slider is 30% by default → deployable = 100 * 0.3 = 30
    // TikTok TopFeed = 50% of 30 = £15
    const tt = doc.getElementById('adp-tt').textContent;
    expect(tt).toBe('£15');
  });

  it('allocates 30% of the deployable budget to Spark Ads', () => {
    // Spark Ads = 30% of 30 = £9
    const spark = doc.getElementById('adp-spark').textContent;
    expect(spark).toBe('£9');
  });

  it('allocates 20% of the deployable budget to Collab', () => {
    // Collab = 20% of 30 = £6
    const collab = doc.getElementById('adp-collab').textContent;
    expect(collab).toBe('£6');
  });

  it('updateReinvest() updates the displayed percentage label', () => {
    doc.getElementById('reinvest').value = '50';
    win.updateReinvest();
    expect(doc.getElementById('reinvest-label').textContent).toBe('50%');
  });

  it('updateReinvest() recalculates the deployable budget', () => {
    // At 50% reinvest, deployable = 100 * 0.5 = 50; TikTok TopFeed = £25
    doc.getElementById('reinvest').value = '50';
    win.updateReinvest();
    expect(doc.getElementById('adp-tt').textContent).toBe('£25');
  });
});

describe('Toast notification — toast()', () => {
  it('sets the toast text content', () => {
    const win = loadApp().window;
    win.toast('Hello test');
    expect(win.document.getElementById('toast').textContent).toBe('Hello test');
  });

  it('adds the "show" class to make the toast visible', () => {
    const win = loadApp().window;
    win.toast('Visible!');
    expect(win.document.getElementById('toast').classList.contains('show')).toBe(true);
  });
});

describe('90-Day Plan — renderPlan()', () => {
  it('renders 13 weekly plan rows', () => {
    const win = loadApp().window;
    win.nav('plan');
    const rows = win.document.querySelectorAll('#plan-rows .plan-row');
    expect(rows.length).toBe(13);
  });

  it('first row is labelled week 1', () => {
    const win = loadApp().window;
    win.nav('plan');
    const firstRow = win.document.querySelector('#plan-rows .plan-row');
    expect(firstRow.textContent).toContain('1');
  });

  it('last row is labelled week 13', () => {
    const win = loadApp().window;
    win.nav('plan');
    const rows = win.document.querySelectorAll('#plan-rows .plan-row');
    expect(rows[12].textContent).toContain('13');
  });
});
