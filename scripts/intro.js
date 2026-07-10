/**
 * intro.js
 * Controla a tela de abertura (splash) da página pública: gera as fagulhas
 * e luzinhas animadas e trata a transição de "entrar" para o conteúdo.
 */

const QTD_PARTICULAS = 16;
const QTD_LUZES = 10;

function criarParticulas(container) {
  for (let i = 0; i < QTD_PARTICULAS; i += 1) {
    const p = document.createElement('span');
    p.className = 'intro__particula';
    const tam = 3 + Math.random() * 4;
    const esquerda = Math.random() * 100;
    const duracao = 5 + Math.random() * 5;
    const atraso = Math.random() * 6;
    const deriva = (Math.random() * 40 - 20).toFixed(0);
    p.style.left = `${esquerda}%`;
    p.style.setProperty('--tam', `${tam}px`);
    p.style.setProperty('--dur', `${duracao}s`);
    p.style.setProperty('--atraso', `${atraso}s`);
    p.style.setProperty('--deriva', `${deriva}px`);
    container.appendChild(p);
  }
}

function criarLuzes(container) {
  for (let i = 0; i < QTD_LUZES; i += 1) {
    const l = document.createElement('span');
    l.className = 'intro__luz';
    l.style.setProperty('--atraso', `${(Math.random() * 2.4).toFixed(2)}s`);
    container.appendChild(l);
  }
}

function iniciarIntro() {
  const introEl = document.getElementById('introScreen');
  if (!introEl) return;

  const particulasEl = introEl.querySelector('.intro__particulas');
  const luzesEl = introEl.querySelector('.intro__luzes');
  if (particulasEl) criarParticulas(particulasEl);
  if (luzesEl) criarLuzes(luzesEl);

  document.body.classList.add('u-sem-scroll');

  const btnEntrar = document.getElementById('btnEntrarIntro');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', () => {
      introEl.classList.add('is-saindo');
      document.body.classList.remove('u-sem-scroll');
      setTimeout(() => introEl.remove(), 750);
    });
  }
}

document.addEventListener('DOMContentLoaded', iniciarIntro);

/**
 * Ao voltar para a página pelo botão "voltar" do navegador, alguns
 * navegadores restauram a página da memória (bfcache) em vez de recarregar
 * o HTML do zero — nesse caso a intro apareceria já removida. Forçamos um
 * recarregamento para garantir que a abertura sempre toque novamente.
 */
window.addEventListener('pageshow', (evento) => {
  if (evento.persisted) {
    window.location.reload();
  }
});

