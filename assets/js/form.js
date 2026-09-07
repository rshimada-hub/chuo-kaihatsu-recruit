/* =========================================================
   採用エントリー フォーム (form.js)
   ・生年月日セレクト生成 ・クライアント検証 ・ボット対策 ・実送信(fetch)
   ・reCAPTCHA v3 連携（任意。SITEKEYを設定すると有効）
   ※クライアント検証は入力補助。実防御はサーバー(Apps Script)側で行う（SECURITY.md）。
   ========================================================= */
(function () {
  'use strict';

  // ===== 設定：デプロイ後にここを埋める =====
  var CONFIG = {
    // Apps Script ウェブアプリのURL（空の間は「プロトタイプ動作」＝送信せず完了表示）
    ENDPOINT: 'https://script.google.com/macros/s/AKfycbzW1ZhXbcZsHn_uq63jrHewpvY16pRQr6tQoy1EmA_NnpHJQLJx4OvM0fbEKfbpc1av3g/exec',
    // reCAPTCHA v3 サイトキー（空なら reCAPTCHA なしで動作）
    RECAPTCHA_SITEKEY: ''
  };
  // ==========================================

  var form = document.getElementById('entryForm');
  if (!form) return;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var renderedAt = Date.now();
  var submitting = false;

  // 生年月日セレクト生成
  function opt(sel, v, label) { var o = document.createElement('option'); o.value = v; o.textContent = label; sel.appendChild(o); }
  var ys = form.querySelector('[name=birth_y]'), ms = form.querySelector('[name=birth_m]'), ds = form.querySelector('[name=birth_d]');
  if (ys) { opt(ys, '', '年'); for (var y = 2010; y >= 1960; y--) opt(ys, y, y); }
  if (ms) { opt(ms, '', '月'); for (var m = 1; m <= 12; m++) opt(ms, m, m); }
  if (ds) { opt(ds, '', '日'); for (var d = 1; d <= 31; d++) opt(ds, d, d); }

  function clear(fld) { fld.classList.remove('invalid'); }
  function validate() {
    var ok = true;
    form.querySelectorAll('.fld').forEach(function (fld) {
      var bad = false;
      fld.querySelectorAll('input,select,textarea').forEach(function (i) {
        if (i.hasAttribute('required') && !(i.value || '').trim()) bad = true;
        if (i.type === 'email' && i.value && !EMAIL.test(i.value.trim())) bad = true;
      });
      fld.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    var c = document.getElementById('consent'), cb = document.getElementById('consentBox');
    if (c && !c.checked) { if (cb) cb.classList.add('invalid'); ok = false; }
    else if (cb) cb.classList.remove('invalid');
    return ok;
  }

  function showError(msg) {
    var box = document.getElementById('formError');
    if (box) { box.textContent = msg; box.classList.add('on'); }
  }
  function setSubmitting(on) {
    submitting = on;
    var btn = form.querySelector('.submit');
    if (btn) { btn.disabled = on; btn.textContent = on ? '送信中…' : '上記の内容で送信する'; }
  }

  function doSend() {
    // ENDPOINT 未設定＝プロトタイプ（送信せず完了表示）
    if (!CONFIG.ENDPOINT) { finish(); return; }
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch(CONFIG.ENDPOINT, {
      method: 'POST',
      mode: 'no-cors', // Apps Scriptはリダイレクトのため応答本文は読めない。POSTは実行される。
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: body
    }).then(function () { finish(); })
      .catch(function () { setSubmitting(false); showError('送信に失敗しました。時間をおいて再度お試しください。'); });
  }
  function finish() {
    form.hidden = true;
    var done = document.getElementById('entryDone');
    if (done) { done.classList.add('on'); done.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (submitting) return;
    var errBox = document.getElementById('formError'); if (errBox) errBox.classList.remove('on');

    // ボット対策：ハニーポット＋送信時間ゲート
    var hp = form.querySelector('input[name=company_url]');
    if (hp && hp.value) { finish(); return; }        // 静かに終了
    if (Date.now() - renderedAt < 3000) { return; }   // 速すぎる送信を無視

    if (!validate()) {
      var f = form.querySelector('.fld.invalid input,.fld.invalid select,.fld.invalid textarea');
      if (f) f.focus();
      return;
    }
    setSubmitting(true);

    // reCAPTCHA v3（SITEKEY設定時のみ）→ トークンを付与してから送信
    if (CONFIG.RECAPTCHA_SITEKEY && window.grecaptcha && grecaptcha.execute) {
      grecaptcha.ready(function () {
        grecaptcha.execute(CONFIG.RECAPTCHA_SITEKEY, { action: 'entry' }).then(function (token) {
          var t = form.querySelector('input[name=recaptcha_token]');
          if (!t) { t = document.createElement('input'); t.type = 'hidden'; t.name = 'recaptcha_token'; form.appendChild(t); }
          t.value = token; doSend();
        }).catch(function () { doSend(); });
      });
    } else {
      doSend();
    }
  });

  form.querySelectorAll('input,select,textarea').forEach(function (el) {
    el.addEventListener('input', function () { var f = el.closest('.fld'); if (f) clear(f); });
    el.addEventListener('change', function () { var f = el.closest('.fld'); if (f) clear(f); });
  });
})();
