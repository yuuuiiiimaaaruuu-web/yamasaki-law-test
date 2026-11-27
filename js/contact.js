// ===== お問い合わせフォーム：入力 → 確認 → 完了 =====
(() => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const steps = {
    input: document.getElementById('stepInput'),
    confirm: document.getElementById('stepConfirm'),
    done: document.getElementById('stepDone'),
  };
  const list = document.getElementById('confirmList');
  const labels = [
    ['category', 'ご相談内容'], ['name', 'お名前'], ['kana', 'ふりがな'], ['company', '会社名'],
    ['tel', '電話番号'], ['email', 'メールアドレス'], ['message', 'お問い合わせ内容'],
  ];
  const esc = (v) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const show = (name) => {
    Object.entries(steps).forEach(([k, el]) => { el.hidden = k !== name; });
    const top = document.querySelector('.page-head').getBoundingClientRect().bottom + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // 入力中は、その項目のエラー表示を消す
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field && e.target.checkValidity()) field.classList.remove('is-error');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstError = null;
    form.querySelectorAll('.field').forEach((field) => {
      const inputs = [...field.querySelectorAll('input, textarea')];
      const radio = inputs.find((i) => i.type === 'radio');
      const ok = radio
        ? !!form.querySelector(`[name="${radio.name}"]:checked`)
        : inputs.every((i) => i.checkValidity());
      field.classList.toggle('is-error', !ok);
      if (!ok && !firstError) firstError = field;
    });
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const data = new FormData(form);
    list.innerHTML = labels.map(([key, label]) => {
      const v = (data.get(key) || '').toString().trim();
      return `<div class="confirm__row"><dt>${label}</dt><dd>${v ? esc(v).replace(/\n/g, '<br>') : '—'}</dd></div>`;
    }).join('');
    show('confirm');
  });

  document.getElementById('btnBack').addEventListener('click', () => show('input'));
  // ※確認用ページのため送信はしない。本番ではフォームサービス等に接続する
  document.getElementById('btnSend').addEventListener('click', () => show('done'));
})();
