/* =========================================================
   共通スクリプト (main.js)
   ・六角形Cロゴ(symbol)の注入  ・ヘッダー状態  ・スクロール演出
   ・右サイドタブ / トップへ戻る
   全ページ共通。chart.js / map.js は該当要素がある時だけ動く。
   ========================================================= */
(function () {
  'use strict';

  // 六角形Cロゴの symbol(#cmark) は各HTMLの先頭に静的にインラインで置く
  // （ユーザー入力を含まないためXSSリスクはないが、DOMインジェクション自体を避ける方針）
  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var top = document.getElementById('top');
  var hero = document.getElementById('hero');
  var rail = document.getElementById('rail');
  var backtop = document.getElementById('backtop');

  // --- ヘッダー状態 / レール表示（FVでは非表示） ---
  function onScroll() {
    var y = window.scrollY;
    var heroH = hero ? hero.offsetHeight : 0;
    var overHero = hero && y < heroH - 80;
    if (top) {
      top.classList.toggle('ontop', !!overHero);
      top.classList.toggle('solid', !overHero);
    }
    var past = hero ? y > heroH - 70 : y > 200;
    if (rail) rail.classList.toggle('on', past);
    if (backtop) backtop.classList.toggle('on', past);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backtop) {
    backtop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: rm ? 'auto' : 'smooth' });
    });
  }

  // --- スクロール演出（reveal）＋ マーカー描画 ---
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.querySelectorAll) {
        e.target.querySelectorAll('.mk').forEach(function (m) { m.classList.add('in'); });
      }
      io.unobserve(e.target);
    });
  }, { threshold: 0.16 });
  document.querySelectorAll('.reveal, h1, .people h2').forEach(function (el) { io.observe(el); });

  // ヒーローのマーカーはロード直後に引く
  setTimeout(function () {
    document.querySelectorAll('#hero .mk').forEach(function (m) { m.classList.add('in'); });
  }, 500);
})();
