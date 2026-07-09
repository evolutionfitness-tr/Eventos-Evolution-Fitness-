/**
 * toast.js
 * Sistema simples de notificações temporárias (toasts).
 */

export const Toast = (() => {
  let containerEl = null;

  function garantirContainer() {
    if (containerEl) return containerEl;
    containerEl = document.createElement('div');
    containerEl.className = 'toast-container';
    containerEl.setAttribute('role', 'status');
    containerEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(containerEl);
    return containerEl;
  }

  /**
   * Exibe uma notificação temporária.
   * @param {string} mensagem
   * @param {'info'|'success'|'error'} tipo
   * @param {number} duracaoMs
   */
  function mostrar(mensagem, tipo = 'info', duracaoMs = 3200) {
    const container = garantirContainer();
    const toastEl = document.createElement('div');
    const classeVariante = tipo === 'success' ? 'toast-success' : tipo === 'error' ? 'toast-error' : '';
    toastEl.className = `toast ${classeVariante}`.trim();
    toastEl.textContent = mensagem;
    container.appendChild(toastEl);

    requestAnimationFrame(() => toastEl.classList.add('is-visible'));

    setTimeout(() => {
      toastEl.classList.remove('is-visible');
      setTimeout(() => toastEl.remove(), 260);
    }, duracaoMs);
  }

  return {
    sucesso: (msg, duracao) => mostrar(msg, 'success', duracao),
    erro: (msg, duracao) => mostrar(msg, 'error', duracao),
    info: (msg, duracao) => mostrar(msg, 'info', duracao),
  };
})();
