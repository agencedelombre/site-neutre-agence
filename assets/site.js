(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Réservation (TODO : remplacer par un calendrier généraliste, celui-ci est dédié aux artisans BTP)
  var BOOKING_URL = 'https://api.leadconnectorhq.com/widget/bookings/diagnostic-artisanszzpxy8wpazah';
  document.querySelectorAll('[data-book]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      if (typeof fbq === 'function') fbq('track', 'Lead');
      window.open(BOOKING_URL, '_blank', 'noopener');
    });
  });

  var yy=document.getElementById('y'); if(yy) yy.textContent = new Date().getFullYear();

  // Nav : fond au scroll + barre de progression + menu mobile
  var nav = document.getElementById('nav'), bar = document.getElementById('progress');
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('scrolled', y > 30);
    bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  var burger = document.getElementById('burger'), links = document.getElementById('links');
  burger.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function(e){ if (e.target.tagName === 'A') { links.classList.remove('open'); nav.classList.remove('menu-open'); burger.setAttribute('aria-expanded', false); } });

  // Titres animés mot par mot
  document.querySelectorAll('.split').forEach(function(el){
    var i = 0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(t){
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w';
            var s = document.createElement('span'); s.textContent = t; s.style.setProperty('--i', i++);
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  });

  // Révélation au scroll
  var targets = document.querySelectorAll('.reveal, .split');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(x){ if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
    targets.forEach(function(t){ io.observe(t); });
  } else targets.forEach(function(t){ t.classList.add('in'); });

  // Compteurs animés
  var counters = document.querySelectorAll('[data-count]');
  function run(el){
    var to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null;
    function f(t){ if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf; if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function(es){ es.forEach(function(x){ if (x.isIntersecting) { run(x.target); co.unobserve(x.target); } }); }, {threshold:.6});
    counters.forEach(function(c){ co.observe(c); });
  }


  // Villes : clic = message dédié + réservation
  var panel = document.getElementById('cityPanel'), ctext = document.getElementById('cityText');
  var cbtns = document.querySelectorAll('.city');
  cbtns.forEach(function(b){
    b.addEventListener('click', function(){
      var c = b.dataset.city;
      cbtns.forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
      ctext.innerHTML = c === 'Toute la France'
        ? '<strong>Partout en France.</strong> On travaille à distance avec des entreprises de toute la France : visio, outils partagés, suivi régulier.'
        : '<strong>Agence de communication à ' + c + '.</strong> On connaît le tissu local et on intervient auprès des entreprises de ' + c + ' et des alentours. Parlons de votre visibilité.';
      panel.hidden = false;
      if (typeof fbq === 'function') fbq('trackCustom', 'CityClick', {city: c});
    });
  });


  // Frise verticale : la ligne se remplit au scroll, les étapes s'allument
  var tls = document.querySelectorAll('.tl');
  function tlUpdate(){
    var vh = innerHeight;
    tls.forEach(function(tl){
      var r = tl.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, (vh * .62 - r.top) / r.height));
      tl.style.setProperty('--p', p);
      tl.querySelectorAll('.tl-item').forEach(function(it){
        var d = it.querySelector('.tl-dot').getBoundingClientRect();
        it.classList.toggle('active', reduce || d.top + d.height / 2 < vh * .62);
      });
    });
  }
  if (tls.length) { addEventListener('scroll', tlUpdate, {passive:true}); addEventListener('resize', tlUpdate); tlUpdate(); }

  // Frise horizontale (méthode) : déclenchée une fois visible
  var hsteps = document.querySelectorAll('.steps');
  if ('IntersectionObserver' in window && !reduce) {
    var so = new IntersectionObserver(function(es){ es.forEach(function(x){ if (x.isIntersecting) { x.target.classList.add('go'); so.unobserve(x.target); } }); }, {threshold:.35});
    hsteps.forEach(function(h){ so.observe(h); });
  } else hsteps.forEach(function(h){ h.classList.add('go'); });

  // Filtres du portfolio
  var fb = document.querySelectorAll('[data-filter]');
  fb.forEach(function(b){
    b.addEventListener('click', function(){
      var f = b.dataset.filter;
      fb.forEach(function(x){ x.setAttribute('aria-pressed', x === b); });
      document.querySelectorAll('[data-cat]').forEach(function(c){
        c.hidden = !(f === 'all' || c.dataset.cat.split(' ').indexOf(f) > -1);
      });
    });
  });


  // Lignes du comparatif : apparition une à une
  var rows = document.querySelectorAll('.cmp-row');
  if (rows.length) {
    if (!reduce && 'IntersectionObserver' in window) {
      var ro = new IntersectionObserver(function(es){ es.forEach(function(x){ if (x.isIntersecting) { var d = Array.prototype.indexOf.call(rows, x.target) % 6; x.target.style.transitionDelay = (d * .06) + 's'; x.target.classList.add('in'); ro.unobserve(x.target); } }); }, {threshold:.35});
      rows.forEach(function(r){ ro.observe(r); });
    } else rows.forEach(function(r){ r.classList.add('in'); });
  }

  // Offres : onglets
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(x){ x.setAttribute('aria-selected', x === t); });
      document.querySelectorAll('.offer-panel').forEach(function(p){ p.classList.toggle('on', p.id === t.getAttribute('aria-controls')); });
    });
  });

  // Calculateur « Le Révélateur »
  var calc = document.getElementById('calc');
  if (calc) {
    var st = {panier:null, rate:null, label:'', obj:null};
    var qs = calc.querySelectorAll('.cq'), dots = calc.querySelectorAll('.calc-dots i'), res = document.getElementById('calc-res');
    function show(n){
      qs.forEach(function(q, i){ q.hidden = i !== n; });
      dots.forEach(function(d, i){ d.classList.toggle('on', i <= n); });
      res.hidden = true;
    }
    function fmt(n){ return n.toLocaleString('fr-FR'); }
    function done(){
      var lost = Math.round(st.obj * st.rate) * st.panier;
      qs.forEach(function(q){ q.hidden = true; });
      dots.forEach(function(d){ d.classList.add('on'); });
      res.hidden = false;
      var el = document.getElementById('calc-amt'), t0 = null;
      function f(t){ if (!t0) t0 = t; var p = Math.min((t - t0) / 1200, 1); el.textContent = fmt(Math.round(lost * (1 - Math.pow(1 - p, 3)))) + ' €'; if (p < 1) requestAnimationFrame(f); }
      if (reduce) el.textContent = fmt(lost) + ' €'; else requestAnimationFrame(f);
      document.getElementById('calc-yr').textContent = 'Soit ' + fmt(lost * 12) + ' € sur une année';
      document.getElementById('calc-exp').textContent = st.label + ' Ces ' + fmt(lost) + ' € par mois vous appartiennent déjà : ils partent simplement chez vos concurrents.';
      if (typeof fbq === 'function') fbq('track', 'ViewContent', {content_name: 'Calculateur résultat', value: lost, currency: 'EUR'});
    }
    calc.addEventListener('click', function(e){
      var b = e.target.closest('button[data-v]'); if (!b) return;
      var q = b.closest('.cq'), n = +q.dataset.q;
      q.querySelectorAll('button').forEach(function(x){ x.classList.toggle('sel', x === b); });
      if (n === 0) st.panier = +b.dataset.v;
      if (n === 1) { st.rate = +b.dataset.v; st.label = b.dataset.l; }
      if (n === 2) st.obj = +b.dataset.v;
      setTimeout(function(){ n < 2 ? show(n + 1) : done(); }, 260);
    });
    document.getElementById('calc-other-ok').addEventListener('click', function(){
      var v = +document.getElementById('calc-other').value;
      if (v > 0) { st.panier = v; setTimeout(function(){ show(1); }, 200); }
    });
    document.getElementById('calc-reset').addEventListener('click', function(){
      st = {panier:null, rate:null, label:'', obj:null};
      calc.querySelectorAll('button.sel').forEach(function(x){ x.classList.remove('sel'); });
      show(0);
    });
  }

  // Mot qui tourne dans le H1
  var words = ['visible.', 'choisie.', 'contactée.', 'rentable.'], rot = document.getElementById('rot');
  if (!reduce) {
    var k = 0;
    if (rot) setInterval(function(){
      var s = rot.firstElementChild; s.className = 'out';
      setTimeout(function(){
        k = (k + 1) % words.length; s.textContent = words[k]; s.className = 'pre';
        void s.offsetWidth; s.className = '';
      }, 450);
    }, 2600);
  }

  // Lueur qui suit la souris sur les cartes + inclinaison de la carte hero
  document.querySelectorAll('.card').forEach(function(c){
    c.addEventListener('pointermove', function(e){
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  var tilt = document.getElementById('tilt');
  if (!reduce && tilt && matchMedia('(hover:hover)').matches) {
    tilt.addEventListener('pointermove', function(e){
      var r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      tilt.style.transform = 'perspective(900px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
    tilt.addEventListener('pointerleave', function(){ tilt.style.transform = ''; });
  }

  // Parallaxe douce des halos du hero
  var blobs = document.querySelectorAll('.hero .blob');
  if (!reduce) addEventListener('scroll', function(){
    var y = Math.min(scrollY, 900);
    blobs.forEach(function(b, i){ b.style.translate = '0 ' + (y * (i ? -.1 : .18)) + 'px'; });
  }, {passive:true});
})();
