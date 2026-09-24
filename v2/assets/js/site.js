/* v2 共通：ヘッダーの透過→不透明。動きはこれと成長グラフ・地図だけ */
(function(){
  'use strict';
  var hd = document.querySelector('.hd');
  if (!hd || hd.classList.contains('on-light')) return;
  function upd(){ hd.classList.toggle('is-solid', window.scrollY > 48); }
  upd(); window.addEventListener('scroll', upd, { passive: true });
})();
