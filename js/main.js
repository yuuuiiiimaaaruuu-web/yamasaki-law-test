(() => {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const video = document.getElementById('heroVideo');

  // スクロールでヘッダー背景を付ける
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 80);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ハンバーガーメニュー
  hamburger.addEventListener('click', () => {
    const open = document.body.classList.toggle('is-menu-open');
    hamburger.setAttribute('aria-expanded', open);
    hamburger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.querySelectorAll('.gnav a').forEach(a => {
    a.addEventListener('click', () => {
      document.body.classList.remove('is-menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  if (!video) return;

  const mq = window.matchMedia('(max-width: 767px)');
  const d = video.dataset;
  const saveData = navigator.connection && navigator.connection.saveData;
  let order = [], idx = 0;

  const setPoster = (list, i = 0) => {
    if (!list[i]) return;
    const img = new Image();
    img.onload = () => { video.poster = list[i]; };
    img.onerror = () => setPoster(list, i + 1);
    img.src = list[i];
  };

  const load = () => {
    if (!order[idx]) return;
    video.src = order[idx];
    video.load();
    video.play().catch(() => {});
  };

  // 画面幅に合わせて タテ（スマホ）/ ヨコ（PC）動画を選ぶ。無ければもう片方で代用
  const apply = () => {
    const isSp = mq.matches;
    setPoster(isSp ? [d.posterSp, d.posterPc] : [d.posterPc, d.posterSp]);
    if (saveData) return; // データセーバーON の方には静止画のみ
    order = isSp ? [d.srcSp, d.srcPc] : [d.srcPc, d.srcSp];
    idx = 0;
    load();
  };
  video.addEventListener('error', () => { idx += 1; load(); });
  // ウィンドウ幅を変えたときも切り替える
  if (mq.addEventListener) mq.addEventListener('change', apply);
  else mq.addListener(apply);
  apply();

  // ヒーローが画面外のときは再生を止めて負荷を下げる
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }).observe(video);
  }
})();

// ===== 三つの強み：スクロール量に合わせて 01→02→03 と切り替える =====
(() => {
  const sec = document.getElementById('strength');
  const list = document.getElementById('strengthList');
  if (!sec || !list) return;
  const items = [...list.querySelectorAll('.strength-item')];
  const photos = [...sec.querySelectorAll('.strength__photos img')];
  const bgs = [...sec.querySelectorAll('.strength__bgs img')];
  const numWrap = sec.querySelector('.strength__num');
  const num = document.getElementById('strengthNum');
  const total = items.length;
  let current = -1;

  const activate = (i) => {
    if (i === current) return;
    current = i;
    items.forEach((el, n) => {
      el.classList.toggle('is-active', n === i);
      const head = el.querySelector('.strength-item__head');
      if (n === i) head.setAttribute('aria-current', 'true'); else head.removeAttribute('aria-current');
    });
    photos.forEach((el, n) => el.classList.toggle('is-active', n === i));
    bgs.forEach((el, n) => el.classList.toggle('is-active', n === i));
    // 番号はふわっと入れ替える
    numWrap.classList.add('is-changing');
    setTimeout(() => {
      num.textContent = String(i + 1).padStart(2, '0');
      numWrap.classList.remove('is-changing');
    }, 200);
  };

  // 高さと固定位置を中身に合わせる
  // ・通常はヘッダーの下10pxで固定
  // ・中身が画面より高いときは、下の104pxまで見える位置で固定
  const sticky = sec.querySelector('.strength__sticky');
  const STEP = 0.7;  // 1項目あたりのスクロール量（画面の高さ×0.7）
  let padTop = 0, pinTop = 0, range = 0;
  const layout = () => {
    const vh = window.innerHeight;
    padTop = parseFloat(getComputedStyle(sec).paddingTop);
    const h = sticky.offsetHeight;
    pinTop = Math.min(padTop, vh - h);
    sticky.style.top = `${pinTop}px`;
    range = vh * STEP * (total - 1);
    sec.style.height = `${padTop + h + range}px`;
  };

  // セクション内でどこまでスクロールしたか（0〜1）
  const progress = () => {
    const naturalTop = sec.getBoundingClientRect().top + padTop;  // 固定されていないときの中身の位置
    return range > 0 ? Math.min(1, Math.max(0, (pinTop - naturalTop) / range)) : 0;
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      activate(Math.min(total - 1, Math.floor(progress() * total)));
      ticking = false;
    });
  };
  layout();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { layout(); onScroll(); });
  window.addEventListener('load', () => { layout(); onScroll(); });
  onScroll();

  // 項目をクリックしたら、その強みが表示される位置までスクロール
  items.forEach((el, i) => {
    el.querySelector('.strength-item__head').addEventListener('click', () => {
      const top = sec.getBoundingClientRect().top + window.scrollY + padTop - pinTop + range * ((i + 0.5) / total);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
