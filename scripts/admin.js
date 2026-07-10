/**
 * admin.js
 * Controlador da área administrativa protegida por senha.
 *
 * NOTA DE SEGURANÇA: como esta é uma aplicação 100% front-end com
 * localStorage, esta senha é apenas uma barreira simples de acesso para a
 * equipe interna — não substitui autenticação real. Quando a camada
 * database.js migrar para Supabase, recomenda-se trocar este mecanismo por
 * Supabase Auth (login por e-mail/senha ou magic link).
 */

import { DB } from './database.js';
import { EventoService } from './event.js';
import { UI } from './ui.js';
import { Helpers } from '../utils/helpers.js';
import { Toast } from '../utils/toast.js';
import { Modal } from '../utils/modal.js';
import { Storage } from './storage.js';

const CHAVE_SENHA = 'adminSenha';
const CHAVE_SESSAO = 'adminSessaoAtiva';
const SENHA_PADRAO = 'evolution2026';

const estado = {
  eventoAtual: null,
  eventos: [],
};

const els = {};

function mapearElementos() {
  els.telaLogin = document.getElementById('telaLogin');
  els.telaPainel = document.getElementById('telaPainel');
  els.formLogin = document.getElementById('formLogin');
  els.inputSenha = document.getElementById('inputSenha');
  els.erroLogin = document.getElementById('erroLogin');

  els.menuBotoes = document.querySelectorAll('[data-secao-alvo]');
  els.secoes = document.querySelectorAll('[data-secao]');
  els.btnSair = document.getElementById('btnSair');

  els.seletorEvento = document.getElementById('seletorEvento');
  els.btnNovoEvento = document.getElementById('btnNovoEvento');

  els.gradeStats = document.getElementById('gradeStats');
  els.listaItensStatus = document.getElementById('listaItensStatus');

  els.tabelaItensBody = document.getElementById('tabelaItensBody');
  els.btnNovoItem = document.getElementById('btnNovoItem');

  els.tabelaParticipantesBody = document.getElementById('tabelaParticipantesBody');
  els.inputBuscaParticipante = document.getElementById('inputBuscaParticipante');
  els.btnExportarCSV = document.getElementById('btnExportarCSV');
  els.btnImprimir = document.getElementById('btnImprimir');
}

/* ==================== AUTENTICAÇÃO ==================== */

function garantirSenhaInicial() {
  if (!Storage.ler(CHAVE_SENHA)) {
    Storage.gravar(CHAVE_SENHA, SENHA_PADRAO);
  }
}

function estaAutenticado() {
  return sessionStorage.getItem(CHAVE_SESSAO) === 'true';
}

function ligarLogin() {
  els.formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const senhaSalva = Storage.ler(CHAVE_SENHA, SENHA_PADRAO);
    if (els.inputSenha.value === senhaSalva) {
      sessionStorage.setItem(CHAVE_SESSAO, 'true');
      mostrarPainel();
    } else {
      els.erroLogin.classList.add('is-visible');
      els.inputSenha.value = '';
    }
  });

  els.btnSair.addEventListener('click', () => {
    sessionStorage.removeItem(CHAVE_SESSAO);
    location.reload();
  });
}

function mostrarPainel() {
  els.telaLogin.classList.add('u-hidden');
  els.telaPainel.classList.remove('u-hidden');
  inicializarPainel();
}

/* ==================== NAVEGAÇÃO ENTRE SEÇÕES ==================== */

function ligarNavegacao() {
  els.menuBotoes.forEach((btn) => {
    btn.addEventListener('click', () => {
      const alvo = btn.dataset.secaoAlvo;
      els.menuBotoes.forEach((b) => b.classList.toggle('is-ativo', b === btn));
      els.secoes.forEach((s) => s.classList.toggle('u-hidden', s.dataset.secao !== alvo));
    });
  });
}

/* ==================== SELETOR DE EVENTO ==================== */

async function carregarEventos() {
  estado.eventos = await DB.listarEventos();
  els.seletorEvento.innerHTML = estado.eventos
    .map((e) => `<option value="${e.id}">${Helpers.escapeHtml(e.nome)} (${e.status})</option>`)
    .join('');

  const ativo = estado.eventos.find((e) => e.status === 'ativo') || estado.eventos[0];
  if (ativo) {
    els.seletorEvento.value = ativo.id;
    estado.eventoAtual = ativo;
  }
}

function ligarSeletorEvento() {
  els.seletorEvento.addEventListener('change', async () => {
    estado.eventoAtual = estado.eventos.find((e) => e.id === els.seletorEvento.value);
    await atualizarTudo();
  });

  els.btnNovoEvento.addEventListener('click', () => abrirModalEvento());
}

function abrirModalEvento(eventoExistente = null) {
  const editando = Boolean(eventoExistente);
  const conteudo = `
    <div class="field">
      <label for="mNome">Nome do evento</label>
      <input type="text" id="mNome" value="${editando ? Helpers.escapeHtml(eventoExistente.nome) : ''}" />
    </div>
    <div class="field">
      <label for="mTipo">Tipo</label>
      <input type="text" id="mTipo" placeholder="Ex.: Festa Junina, Halloween, Confraternização" value="${editando ? Helpers.escapeHtml(eventoExistente.tipo || '') : ''}" />
    </div>
    <div class="field">
      <label for="mDescricao">Descrição</label>
      <textarea id="mDescricao">${editando ? Helpers.escapeHtml(eventoExistente.descricao || '') : ''}</textarea>
    </div>
    <div class="field">
      <label for="mData">Data e hora</label>
      <input type="datetime-local" id="mData" value="${editando && eventoExistente.data ? eventoExistente.data.slice(0, 16) : ''}" />
    </div>
    <div class="field">
      <label for="mLocal">Local</label>
      <input type="text" id="mLocal" value="${editando ? Helpers.escapeHtml(eventoExistente.local || '') : ''}" />
    </div>
    <div class="field">
      <label for="mStatus">Status</label>
      <select id="mStatus">
        <option value="ativo" ${editando && eventoExistente.status === 'ativo' ? 'selected' : ''}>Ativo</option>
        <option value="encerrado" ${editando && eventoExistente.status === 'encerrado' ? 'selected' : ''}>Encerrado</option>
      </select>
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline btn-block" id="btnCancelarEvento">Cancelar</button>
      <button type="button" class="btn btn-primary btn-block" id="btnSalvarEvento">Salvar</button>
    </div>
  `;

  Modal.abrir({ titulo: editando ? 'Editar evento' : 'Novo evento', conteudo });
  document.getElementById('btnCancelarEvento').addEventListener('click', () => Modal.fechar());
  document.getElementById('btnSalvarEvento').addEventListener('click', async () => {
    const dados = {
      nome: document.getElementById('mNome').value.trim(),
      tipo: document.getElementById('mTipo').value.trim(),
      descricao: document.getElementById('mDescricao').value.trim(),
      data: document.getElementById('mData').value,
      local: document.getElementById('mLocal').value.trim(),
      status: document.getElementById('mStatus').value,
    };
    if (!dados.nome) {
      Toast.erro('Informe o nome do evento.');
      return;
    }

    if (editando) {
      await DB.atualizarEvento(eventoExistente.id, dados);
      Toast.sucesso('Evento atualizado.');
    } else {
      await DB.criarEvento({ ...dados, imagem: 'assets/images/evento-capa.svg' });
      Toast.sucesso('Evento criado.');
    }
    Modal.fechar();
    await carregarEventos();
    await atualizarTudo();
  });
}

/* ==================== DASHBOARD / ESTATÍSTICAS ==================== */

async function renderizarDashboard() {
  if (!estado.eventoAtual) {
    els.gradeStats.innerHTML = UI.estadoVazio('Nenhum evento cadastrado ainda.');
    return;
  }
  const stats = await EventoService.calcularEstatisticas(estado.eventoAtual.id);

  els.gradeStats.innerHTML = [
    UI.statCard('Total de convidados', stats.totalConvidados),
    UI.statCard('Confirmados', stats.confirmados),
    UI.statCard('Não irão', stats.naoIrao),
    UI.statCard('Acompanhantes', stats.totalAcompanhantes),
    UI.statCard('Total estimado de pessoas', stats.totalGeralPessoas),
    UI.statCard('Itens completos', stats.itensCompletos),
    UI.statCard('Itens faltando', stats.itensFaltando),
  ].join('');

  els.listaItensStatus.innerHTML = stats.itens
    .map(
      (i) => `
      <div class="item-card ${i.restante === 0 ? 'is-completo' : ''}">
        <div class="item-card__top">
          <h3 class="item-card__nome">${Helpers.escapeHtml(i.nome)}</h3>
          <div class="item-card__ring" style="--pct: ${i.pct}"><span>${i.pct}%</span></div>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${i.pct}%"></div></div>
        <p class="item-card__meta"><strong>${i.escolhido}</strong> de ${i.necessario} &middot; restam <strong>${i.restante}</strong></p>
      </div>`
    )
    .join('') || UI.estadoVazio('Nenhum item cadastrado.');
}

/* ==================== GESTÃO DE ITENS ==================== */

async function renderizarTabelaItens() {
  if (!estado.eventoAtual) {
    els.tabelaItensBody.innerHTML = '<tr><td colspan="5">Nenhum evento selecionado.</td></tr>';
    return;
  }
  const itens = await DB.listarItensPorEvento(estado.eventoAtual.id);

  els.tabelaItensBody.innerHTML =
    itens
      .map(
        (i) => `
      <tr>
        <td>${Helpers.escapeHtml(i.nome)}</td>
        <td>${i.necessario}</td>
        <td>${i.escolhido}</td>
        <td>${Math.max(0, i.necessario - i.escolhido)}</td>
        <td>
          <button type="button" class="btn btn-sm btn-ghost btn-editar-item" data-id="${i.id}">Editar</button>
          <button type="button" class="btn btn-sm btn-ghost btn-excluir-item" data-id="${i.id}">Excluir</button>
        </td>
      </tr>`
      )
      .join('') || '<tr><td colspan="5">Nenhum item cadastrado.</td></tr>';

  els.tabelaItensBody.querySelectorAll('.btn-editar-item').forEach((btn) =>
    btn.addEventListener('click', async () => {
      const item = itens.find((i) => i.id === btn.dataset.id);
      abrirModalItem(item);
    })
  );
  els.tabelaItensBody.querySelectorAll('.btn-excluir-item').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (confirm('Excluir este item? Esta ação não pode ser desfeita.')) {
        await DB.excluirItem(btn.dataset.id);
        Toast.sucesso('Item excluído.');
        await renderizarTabelaItens();
        await renderizarDashboard();
      }
    })
  );
}

function abrirModalItem(itemExistente = null) {
  const editando = Boolean(itemExistente);
  const conteudo = `
    <div class="field">
      <label for="mNomeItem">Nome do item</label>
      <input type="text" id="mNomeItem" value="${editando ? Helpers.escapeHtml(itemExistente.nome) : ''}" />
    </div>
    <div class="field">
      <label for="mNecessario">Quantidade necessária</label>
      <input type="number" id="mNecessario" min="1" value="${editando ? itemExistente.necessario : 1}" />
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline btn-block" id="btnCancelarItem">Cancelar</button>
      <button type="button" class="btn btn-primary btn-block" id="btnSalvarItem">Salvar</button>
    </div>
  `;
  Modal.abrir({ titulo: editando ? 'Editar item' : 'Novo item', conteudo });
  document.getElementById('btnCancelarItem').addEventListener('click', () => Modal.fechar());
  document.getElementById('btnSalvarItem').addEventListener('click', async () => {
    const nome = document.getElementById('mNomeItem').value.trim();
    const necessario = Number(document.getElementById('mNecessario').value) || 1;
    if (!nome) {
      Toast.erro('Informe o nome do item.');
      return;
    }
    if (editando) {
      await DB.atualizarItem(itemExistente.id, { nome, necessario });
      Toast.sucesso('Item atualizado.');
    } else {
      await DB.criarItem({ eventoId: estado.eventoAtual.id, nome, necessario });
      Toast.sucesso('Item criado.');
    }
    Modal.fechar();
    await renderizarTabelaItens();
    await renderizarDashboard();
  });
}

/* ==================== PARTICIPANTES ==================== */

let participantesCache = [];

async function renderizarParticipantes() {
  if (!estado.eventoAtual) return;
  participantesCache = await DB.listarParticipantesPorEvento(estado.eventoAtual.id);
  filtrarERenderizarParticipantes();
}

function filtrarERenderizarParticipantes() {
  const termo = (els.inputBuscaParticipante.value || '').toLowerCase().trim();
  const filtrados = termo
    ? participantesCache.filter(
        (p) => p.nome.toLowerCase().includes(termo) || p.telefone.includes(termo)
      )
    : participantesCache;

  els.tabelaParticipantesBody.innerHTML =
    filtrados.map((p) => UI.linhaParticipante(p)).join('') ||
    '<tr><td colspan="7">Nenhum participante encontrado.</td></tr>';

  els.tabelaParticipantesBody.querySelectorAll('.btn-excluir-participante').forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (confirm('Excluir este participante? Os itens reservados serão liberados.')) {
        await DB.excluirParticipante(btn.dataset.id);
        Toast.sucesso('Participante excluído.');
        await renderizarParticipantes();
        await renderizarDashboard();
        await renderizarTabelaItens();
      }
    })
  );
}

function ligarBuscaEExportacao() {
  els.inputBuscaParticipante.addEventListener('input', Helpers.debounce(filtrarERenderizarParticipantes, 200));

  els.btnExportarCSV.addEventListener('click', async () => {
    const linhas = await EventoService.listarParaExportacao(estado.eventoAtual.id);
    const csv = Helpers.paraCSV(linhas, [
      { chave: 'nome', titulo: 'Nome' },
      { chave: 'telefone', titulo: 'Telefone' },
      { chave: 'participa', titulo: 'Participa' },
      { chave: 'acompanhantes', titulo: 'Acompanhantes' },
      { chave: 'itens', titulo: 'Itens' },
      { chave: 'observacoes', titulo: 'Observações' },
      { chave: 'confirmadoEm', titulo: 'Confirmado em' },
    ]);
    Helpers.baixarArquivo(`participantes-${estado.eventoAtual.id}.csv`, csv);
    Toast.sucesso('Exportação CSV gerada.');
  });

  els.btnImprimir.addEventListener('click', () => window.print());
}

/* ==================== INICIALIZAÇÃO ==================== */

async function atualizarTudo() {
  await Promise.all([renderizarDashboard(), renderizarTabelaItens(), renderizarParticipantes()]);
}

async function inicializarPainel() {
  await DB.iniciar();
  await carregarEventos();
  ligarSeletorEvento();
  ligarBuscaEExportacao();

  els.btnNovoItem.addEventListener('click', () => abrirModalItem());

  await atualizarTudo();
}

function iniciar() {
  mapearElementos();
  garantirSenhaInicial();
  ligarNavegacao();
  ligarLogin();

  if (estaAutenticado()) {
    mostrarPainel();
  }
}

document.addEventListener('DOMContentLoaded', iniciar);
