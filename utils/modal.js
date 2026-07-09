/**
 * modal.js
 * Componente de modal reutilizável, criado dinamicamente no DOM.
 */

export const Modal = (() => {
  let overlayEl = null;
  let onCloseCallback = null;

  function garantirEstrutura() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.className = 'modal-overlay';
    overlayEl.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title"></h3>
          <button type="button" class="modal-close" aria-label="Fechar">&times;</button>
        </div>
        <div class="modal-body"></div>
      </div>
    `;
    document.body.appendChild(overlayEl);

    overlayEl.querySelector('.modal-close').addEventListener('click', () => Modal.fechar());
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) Modal.fechar();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlayEl.classList.contains('is-open')) Modal.fechar();
    });

    return overlayEl;
  }

  return {
    /**
     * Abre o modal.
     * @param {Object} opcoes
     * @param {string} opcoes.titulo
     * @param {string|HTMLElement} opcoes.conteudo - HTML string ou elemento
     * @param {Function} [opcoes.aoFechar]
     */
    abrir({ titulo = '', conteudo = '', aoFechar = null } = {}) {
      const el = garantirEstrutura();
      el.querySelector('.modal-title').textContent = titulo;
      const body = el.querySelector('.modal-body');
      body.innerHTML = '';
      if (typeof conteudo === 'string') {
        body.innerHTML = conteudo;
      } else if (conteudo instanceof HTMLElement) {
        body.appendChild(conteudo);
      }
      onCloseCallback = aoFechar;
      requestAnimationFrame(() => el.classList.add('is-open'));
      document.body.style.overflow = 'hidden';
      return el;
    },

    fechar() {
      if (!overlayEl) return;
      overlayEl.classList.remove('is-open');
      document.body.style.overflow = '';
      if (typeof onCloseCallback === 'function') onCloseCallback();
    },

    corpo() {
      return overlayEl ? overlayEl.querySelector('.modal-body') : null;
    },
  };
})();
