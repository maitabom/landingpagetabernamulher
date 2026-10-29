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
  if (dock && 'IntersectionObserver' in window) {
    var visiveis = new Set();
    var passouHero = false;
    var obsDock = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) visiveis.add(e.target);
        else visiveis.delete(e.target);
        if (e.target.id === 'cta-hero') passouHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      });
      var mostrar = passouHero && visiveis.size === 0;
      dock.classList.toggle('is-on', mostrar);
      dock.setAttribute('aria-hidden', mostrar ? 'false' : 'true');
      dockLink.tabIndex = mostrar ? 0 : -1;
    });
    alvos.forEach(function (el) { obsDock.observe(el); });
  }

  // Meta Pixel: registra cliques nos grupos, redes da ADM e apoio
  var eventosPersonalizados = {
    secondary: 'CliqueGrupoSecundario',
    social: 'CliqueRedeSocialADM',
    support: 'CliqueApoio'
  };
  document.querySelectorAll('[data-track]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof window.fbq !== 'function') return;
      var tipo = link.getAttribute('data-track');
      var dados = { content_name: link.getAttribute('data-group') };
      if (tipo === 'main') {
        window.fbq('track', 'Lead', dados);
      } else if (eventosPersonalizados[tipo]) {
        window.fbq('trackCustom', eventosPersonalizados[tipo], dados);
      }
    });
  });
})();
