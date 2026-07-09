/**
 * ui.js
 * Funções puras de renderização (HTML como string), reutilizadas por
 * app.js e admin.js. Não acessam o banco de dados diretamente.
 */

import { Helpers } from '../utils/helpers.js';

export const UI = {
  /** Renderiza um card de item com anel de progresso e barra de progresso. */
  cardItem(item, { podeEscolher = true } = {}) {
    const restante = Math.max(0, item.necessario - item.escolhido);
    const pct = item.necessario > 0 ? Math.round((item.escolhido / item.necessario) * 100) : 0;
    const completo = restante === 0;
    const nome = Helpers.escapeHtml(item.nome);

    return `
      <article class="item-card ${completo ? 'is-completo' : ''}" data-item-id="${item.id}">
        <div class="item-card__top">
          <h3 class="item-card__nome">${nome}</h3>
          <div class="item-card__ring" style="--pct: ${pct}"><span>${pct}%</span></div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${pct}%"></div>
        </div>
        <p class="item-card__meta">
          <strong>${item.escolhido}</strong> de ${item.necessario} escolhidos
          &middot; ${completo ? 'completo' : `restam <strong>${restante}</strong>`}
        </p>
        ${
          podeEscolher
            ? `<button type="button" class="btn ${completo ? 'btn-disabled' : 'btn-outline'} btn-block btn-escolher-item"
                 data-item-id="${item.id}" data-item-nome="${nome}" data-restante="${restante}"
                 ${completo ? 'disabled' : ''}>
                 ${completo ? 'Esgotado' : 'Escolher'}
               </button>`
            : ''
        }
      </article>
    `;
  },

  /** Badge de status do participante (Sim / Não). */
  badgeStatus(participa) {
    return participa
      ? '<span class="badge badge-success">Confirmado</span>'
      : '<span class="badge badge-danger">Não vai</span>';
  },

  /** Card de estatística simples para o dashboard admin. */
  statCard(label, valor) {
    return `
      <div class="stat-card anim-fade-in">
        <span class="stat-card__label">${label}</span>
        <span class="stat-card__value">${valor}</span>
        <span class="stat-card__accent"></span>
      </div>
    `;
  },

  /** Estado vazio genérico. */
  estadoVazio(mensagem, icone = '&mdash;') {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">${icone}</div>
        <p>${mensagem}</p>
      </div>
    `;
  },

  /** Linha de tabela de participante (admin). */
  linhaParticipante(p) {
    const itens = (p.itensEscolhidos || []).map((i) => `${Helpers.escapeHtml(i.nome)} (${i.quantidade})`).join(', ') || '—';
    return `
      <tr data-participante-id="${p.id}">
        <td>${Helpers.escapeHtml(p.nome)}</td>
        <td>${Helpers.escapeHtml(p.telefone)}</td>
        <td>${this.badgeStatus(p.participa)}</td>
        <td>${p.acompanhantes ?? 0}</td>
        <td>${itens}</td>
        <td>${Helpers.escapeHtml(p.observacoes || '—')}</td>
        <td>
          <button type="button" class="btn btn-sm btn-ghost btn-excluir-participante" data-id="${p.id}">Excluir</button>
        </td>
      </tr>
    `;
  },

  /** Skeleton de carregamento para a grade de itens. */
  skeletonGrade(qtd = 6) {
    return Array.from({ length: qtd })
      .map(
        () => `
        <div class="item-card">
          <div class="skeleton" style="height:20px;width:60%;margin-bottom:12px;"></div>
          <div class="skeleton" style="height:8px;width:100%;margin-bottom:12px;"></div>
          <div class="skeleton" style="height:36px;width:100%;"></div>
        </div>`
      )
      .join('');
  },
};
