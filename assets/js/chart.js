/* =========================================================
   成長グラフ (chart.js) — トップページのみ
   売上6億→20億の内訳を積み上げ面グラフ（右肩上がり・なめらか曲線）で描画。
   #areaChart が無いページでは何もしない。
   数値は「内訳イメージ」。実データが出たら DATA を差し替える。
   ========================================================= */
(function () {
  'use strict';
  var chart = document.getElementById('areaChart');
  if (!chart) return;
  var rm = matchMedia('(prefers-reduced-motion:reduce)').matches;

  var years = [2026, 2028, 2030, 2032, 2035];
  var layers = [
    { c: '#7d1e56', v: [3.0, 3.4, 4.0, 4.8, 6.0] }, // 不動産売買・仲介
    { c: '#b31570', v: [2.0, 2.3, 2.8, 3.6, 4.8] }, // 賃貸仲介・管理
    { c: '#e4007f', v: [0.7, 1.0, 1.8, 3.2, 5.6] }, // リフォーム（拡大）
    { c: '#ff67b0', v: [0.3, 0.5, 0.9, 1.9, 3.6] }  // 分譲・まちづくり
  ];
  var L = 54, Rr = 676, T = 26, B = 326, maxV = 22;
  function X(y) { return L + ((y - 2026) / 9) * (Rr - L); }
  function Y(v) { return B - (v / maxV) * (B - T); }
  function toPts(arr) { return years.map(function (yr, i) { return [X(yr), Y(arr[i])]; }); }
  // Catmull-Rom → ベジェでなめらかに
  function curve(p) {
    var d = '';
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) +
        ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  var s = '';
  [5, 10, 15, 20].forEach(function (g) {
    var yy = Y(g);
    s += '<line x1="' + L + '" y1="' + yy + '" x2="' + Rr + '" y2="' + yy + '" stroke="var(--line)" stroke-width="1"/>';
    s += '<text x="' + (L - 8) + '" y="' + (yy + 4) + '" text-anchor="end" font-family="Outfit" font-size="11" fill="var(--ink-3)">' + g + '</text>';
  });
  var cum = [0, 0, 0, 0, 0];
  layers.forEach(function (ly) {
    var up = cum.map(function (c, i) { return c + ly.v[i]; });
    var U = toPts(up), Lo = toPts(cum);
    var d = 'M' + U[0][0].toFixed(1) + ' ' + U[0][1].toFixed(1) + curve(U) +
      ' L' + Lo[Lo.length - 1][0].toFixed(1) + ' ' + Lo[Lo.length - 1][1].toFixed(1) +
      curve(Lo.slice().reverse()) + ' Z';
    s += '<path d="' + d + '" fill="' + ly.c + '"/>';
    cum = up;
  });
  // 軸
  s += '<line x1="' + L + '" y1="' + B + '" x2="' + (Rr + 6) + '" y2="' + B + '" stroke="var(--ink-3)" stroke-width="1.5"/>';
  s += '<line x1="' + L + '" y1="' + B + '" x2="' + L + '" y2="' + (T - 8) + '" stroke="var(--ink-3)" stroke-width="1.5"/>';
  s += '<path d="M' + L + ' ' + (T - 14) + ' l-4 8 h8 z" fill="var(--ink-3)"/>';
  s += '<text x="' + (L - 6) + '" y="' + (T - 20) + '" font-family="Zen Kaku Gothic New" font-weight="700" font-size="13" fill="var(--ink-2)">売上高（億円）</text>';
  years.forEach(function (yr) {
    s += '<text x="' + X(yr) + '" y="' + (B + 22) + '" text-anchor="middle" font-family="Outfit" font-weight="600" font-size="12" fill="var(--ink-3)">' + yr + '</text>';
  });
  s += '<text x="' + X(2026) + '" y="' + (B + 40) + '" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="10.5" fill="var(--brand)">NOW</text>';
  s += '<text x="' + X(2035) + '" y="' + (B + 40) + '" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="10.5" fill="var(--brand)">GOAL</text>';
  s += '<text x="' + (X(2026) + 6) + '" y="' + (Y(6) - 8) + '" font-family="Outfit" font-weight="800" font-size="13" fill="var(--ink)">6.0</text>';
  s += '<text x="' + X(2035) + '" y="' + (Y(20) - 8) + '" text-anchor="end" font-family="Outfit" font-weight="800" font-size="16" fill="var(--brand)">20</text>';

  chart.innerHTML = s; // s は定数データから生成した静的SVG（ユーザー入力なし）

  // 左→右ワイプ描画
  if (!rm) {
    var ns = 'http://www.w3.org/2000/svg';
    var cw = document.createElementNS(ns, 'clipPath'); cw.id = 'wipe';
    var rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', L); rect.setAttribute('y', 0); rect.setAttribute('height', 372); rect.setAttribute('width', 0);
    cw.appendChild(rect); chart.appendChild(cw);
    var g = document.createElementNS(ns, 'g'); g.setAttribute('clip-path', 'url(#wipe)');
    Array.prototype.slice.call(chart.querySelectorAll('path[fill^="#"]')).forEach(function (p) { g.appendChild(p); });
    chart.appendChild(g);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var w = Rr - L, t0 = null;
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / 1300, 1), e2 = 1 - Math.pow(1 - p, 3);
          rect.setAttribute('width', w * e2);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.disconnect();
      });
    }, { threshold: 0.3 });
    io.observe(chart);
  }
})();
