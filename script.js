(function () {
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pétalas de sakura caindo
  var petalas = document.querySelector('.petals');
  if (petalas && !reduzMovimento) {
    var total = window.innerWidth < 720 ? 12 : 20;
    for (var i = 0; i < total; i++) {
      var p = document.createElement('span');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--s', 8 + Math.random() * 8 + 'px');
      p.style.setProperty('--d', 9 + Math.random() * 9 + 's');
      p.style.setProperty('--atraso', -Math.random() * 18 + 's');
      p.style.setProperty('--x', (Math.random() * 120 - 60) + 'px');
      petalas.appendChild(p);
    }
  }

  // Barras de atributo enchem quando a ficha aparece
  var ficha = document.querySelector('.sheet');
  if (ficha && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas, obs) {
      if (entradas[0].isIntersecting) {
        ficha.classList.add('is-on');
        obs.disconnect();
      }
    }, { threshold: 0.35 }).observe(ficha);
  } else if (ficha) {
    ficha.classList.add('is-on');
  }

  // Barra fixa: aparece quando os botões principais saem da tela
  var dock = document.querySelector('.dock');
  var dockLink = dock && dock.querySelector('a');
  var alvos = document.querySelectorAll('#cta-hero, .final .cta');
  var dockVisivel = false;

  function aplicarDock() {
    if (!dock) return;
    var liberar = dockVisivel && !document.documentElement.classList.contains('cookies-pendente');
    dock.classList.toggle('is-on', dockVisivel);
    dock.setAttribute('aria-hidden', liberar ? 'false' : 'true');
    if (dockLink) dockLink.tabIndex = liberar ? 0 : -1;
  }

  if (dock && 'IntersectionObserver' in window) {
    var visiveis = new Set();
    var passouHero = false;
    var obsDock = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) visiveis.add(e.target);
        else visiveis.delete(e.target);
        if (e.target.id === 'cta-hero') passouHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      });
      dockVisivel = passouHero && visiveis.size === 0;
      aplicarDock();
    });
    alvos.forEach(function (el) { obsDock.observe(el); });
  }

  // Meta Pixel: registra cliques nos grupos, redes da ADM e apoio
  var eventosPersonalizados = {
    secondary: 'CliqueGrupoSecundario',
    social: 'CliqueRedeSocialADM',
    support: 'CliqueApoio'
  };

  function lerCookies() {
    try { return localStorage.getItem('taberna-cookies'); }
    catch (e) { return null; }
  }

  function salvarCookies(valor) {
    try { localStorage.setItem('taberna-cookies', valor); }
    catch (e) {}
  }

  function limparCookiesMeta() {
    ['_fbp', '_fbc'].forEach(function (nome) {
      document.cookie = nome + '=; Max-Age=0; path=/; SameSite=Lax';
    });
  }

  function carregarPixel() {
    var id = window.META_PIXEL_ID;
    if (!/^\d+$/.test(id)) return;
    if (window.__pixelCarregado) {
      if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
      return;
    }
    window.__pixelCarregado = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', id);
    window.fbq('track', 'PageView');
  }

  document.querySelectorAll('[data-track]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (lerCookies() !== 'aceito' || typeof window.fbq !== 'function') return;
      var tipo = link.getAttribute('data-track');
      var dados = { content_name: link.getAttribute('data-group') };
      if (tipo === 'main') {
        window.fbq('track', 'Lead', dados);
      } else if (eventosPersonalizados[tipo]) {
        window.fbq('trackCustom', eventosPersonalizados[tipo], dados);
      }
    });
  });

  var barra = document.getElementById('cookies');
  var botaoAceitar = document.getElementById('cookies-aceitar');
  var botaoRecusar = document.getElementById('cookies-recusar');
  var botaoReabrir = document.getElementById('cookies-reabrir');

  function medirBarra() {
    var aberta = document.documentElement.classList.contains('cookies-pendente');
    if (!barra || !aberta) {
      document.documentElement.style.setProperty('--cookies-h', '0px');
      return;
    }
    document.documentElement.style.setProperty('--cookies-h', barra.offsetHeight + 'px');
  }

  function mostrarBarra(focar) {
    if (!barra) return;
    document.documentElement.classList.add('cookies-pendente');
    medirBarra();
    aplicarDock();
    if (focar && botaoRecusar) botaoRecusar.focus({ preventScroll: true });
  }

  function fecharBarra() {
    if (!barra) return;
    document.documentElement.classList.remove('cookies-pendente');
    medirBarra();
    aplicarDock();
  }

  function escolher(valor) {
    salvarCookies(valor);
    if (valor === 'aceito') carregarPixel();
    else limparCookiesMeta();
    fecharBarra();
  }

  if (botaoAceitar) botaoAceitar.addEventListener('click', function () { escolher('aceito'); });
  if (botaoRecusar) botaoRecusar.addEventListener('click', function () { escolher('recusado'); });
  if (botaoReabrir) botaoReabrir.addEventListener('click', function () { mostrarBarra(true); });

  if (lerCookies() === 'aceito') carregarPixel();
  else if (lerCookies() !== 'recusado') mostrarBarra(false);

  window.addEventListener('resize', medirBarra);
})();
