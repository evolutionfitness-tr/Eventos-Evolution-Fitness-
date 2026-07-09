/**
 * app.js
 * Controlador da tela pública (index.html): exibe o evento ativo,
 * processa a confirmação de presença e a escolha de itens.
 */

import { DB } from './database.js';
import { EventoService } from './event.js';
import { UI } from './ui.js';
import { Helpers } from '../utils/helpers.js';
import { Toast } from '../utils/toast.js';
import { Modal } from '../utils/modal.js';
import { Integracoes } from './integracoes.js';

const estado = {
  evento: null,
  participante: null, // participante atual, após confirmar presença
};

const els = {};

function mapearElementos() {
  els.heroTitulo = document.getElementById('heroTitulo');
  els.heroDescricao = document.getElementById('heroDescricao');
  els.heroData = document.getElementById('heroData');
  els.heroLocal = document.getElementById('heroLocal');
  els.heroImagem = document.getElementById('heroImagem');

  els.secaoConfirmacao = document.getElementById('secaoConfirmacao');
  els.formConfirmacao = document.getElementById('formConfirmacao');
  els.inputNome = document.getElementById('inputNome');
  els.inputTelefone = document.getElementById('inputTelefone');
  els.inputAcompanhantes = document.getElementById('inputAcompanhantes');
  els.inputObservacoes = document.getElementById('inputObservacoes');
  els.radiosParticipa = document.querySelectorAll('input[name="participa"]');
  els.pillSim = document.getElementById('pillSim');
  els.pillNao = document.getElementById('pillNao');

  els.secaoItens = document.getElementById('secaoItens');
  els.gradeItens = document.getElementById('gradeItens');
  els.resumoConfirmado = document.getElementById('resumoConfirmado');
  els.nomeConfirmado = document.getElementById('nomeConfirmado');
  els.btnTrocarParticipante = document.getElementById('btnTrocarParticipante');
  els.btnWhatsAppItens = document.getElementById('btnWhatsAppItens');
  els.btnWhatsAppResumo = document.getElementById('btnWhatsAppResumo');
}

async function carregarEvento() {
  estado.evento = await DB.obterEventoAtivo();
  if (!estado.evento) {
    els.heroTitulo.textContent = 'Nenhum evento ativo no momento';
    els.heroDescricao.textContent = 'Volte em breve para conferir os próximos eventos da Evolution Fitness Studio.';
    els.secaoConfirmacao.classList.add('u-hidden');
    return;
  }

  els.heroTitulo.textContent = estado.evento.nome;
  els.heroDescricao.textContent = estado.evento.descricao;
  els.heroData.innerHTML = `<strong>${Helpers.formatarData(estado.evento.data)}</strong>`;
  els.heroLocal.innerHTML = `<strong>${Helpers.escapeHtml(estado.evento.local || '')}</strong>`;
  if (estado.evento.imagem) {
    els.heroImagem.src = estado.evento.imagem;
    els.heroImagem.alt = estado.evento.nome;
  }
}

function atualizarPillsVisual() {
  const valor = document.querySelector('input[name="participa"]:checked')?.value;
  els.pillSim.classList.toggle('is-active-sim', valor === 'sim');
  els.pillNao.classList.toggle('is-active-nao', valor === 'nao');
}

function validarFormulario(dados) {
  let valido = true;
  const marcarErro = (input, mensagemId, condicaoErro) => {
    const msgEl = document.getElementById(mensagemId);
    input.classList.toggle('field-error', condicaoErro);
    if (msgEl) msgEl.classList.toggle('is-visible', condicaoErro);
    if (condicaoErro) valido = false;
  };

  marcarErro(els.inputNome, 'erroNome', !Helpers.nomeValido(dados.nome));
  marcarErro(els.inputTelefone, 'erroTelefone', !Helpers.telefoneValido(dados.telefone));
  return valido;
}

async function aoEnviarConfirmacao(e) {
  e.preventDefault();
  const participaSelecionado = document.querySelector('input[name="participa"]:checked');

  const dados = {
    nome: els.inputNome.value,
    telefone: els.inputTelefone.value,
    participa: participaSelecionado ? participaSelecionado.value === 'sim' : null,
    acompanhantes: els.inputAcompanhantes.value || 0,
    observacoes: els.inputObservacoes.value,
  };

  if (dados.participa === null) {
    Toast.erro('Selecione se você vai participar.');
    return;
  }
  if (!validarFormulario(dados)) {
    Toast.erro('Confira os campos destacados.');
    return;
  }

  const participante = await EventoService.confirmarPresenca(estado.evento.id, dados);
  estado.participante = participante;
  Toast.sucesso('Presença confirmada com sucesso!');

  // Envio automático para a Planilha Google — silencioso, não bloqueia o fluxo.
  Integracoes.enviarParaPlanilha(participante, participante.itensEscolhidos || []);

  els.secaoConfirmacao.classList.add('u-hidden');

  if (participante.participa) {
    els.nomeConfirmado.textContent = participante.nome;
    els.secaoItens.classList.remove('u-hidden');
    await renderizarItens();
    if (els.btnWhatsAppItens) {
      els.btnWhatsAppItens.onclick = () =>
        Integracoes.abrirWhatsApp(estado.participante, estado.participante.itensEscolhidos || [], estado.evento.nome);
    }
  } else {
    els.resumoConfirmado.classList.remove('u-hidden');
    els.resumoConfirmado.querySelector('[data-resumo-texto]').textContent =
      'Sentiremos sua falta! Sua resposta foi registrada.';
    if (els.btnWhatsAppResumo) {
      els.btnWhatsAppResumo.onclick = () =>
        Integracoes.abrirWhatsApp(estado.participante, [], estado.evento.nome);
    }
  }
}

async function renderizarItens() {
  els.gradeItens.innerHTML = UI.skeletonGrade();
  const itens = await DB.listarItensPorEvento(estado.evento.id);

  if (itens.length === 0) {
    els.gradeItens.innerHTML = UI.estadoVazio('Nenhum item cadastrado para este evento ainda.');
    return;
  }

  els.gradeItens.innerHTML = itens.map((item) => UI.cardItem(item)).join('');
  els.gradeItens.classList.add('anim-stagger');
  els.gradeItens.querySelectorAll('.btn-escolher-item').forEach((btn) => {
    btn.addEventListener('click', () => abrirModalEscolha(btn.dataset.itemId, btn.dataset.itemNome, Number(btn.dataset.restante)));
  });
}

function abrirModalEscolha(itemId, itemNome, restante) {
  const conteudo = `
    <p class="u-mt-1" style="color: var(--color-muted); margin-bottom: var(--space-4);">
      Quantas unidades de <strong>${Helpers.escapeHtml(itemNome)}</strong> você vai levar?
      Restam <strong>${restante}</strong> para completar.
    </p>
    <div class="field">
      <label for="inputQuantidadeModal">Quantidade</label>
      <input type="number" id="inputQuantidadeModal" min="1" max="${restante}" value="1" />
    </div>
    <div class="modal-actions">
      <button type="button" class="btn btn-outline btn-block" id="btnCancelarEscolha">Cancelar</button>
      <button type="button" class="btn btn-primary btn-block" id="btnConfirmarEscolha">Confirmar</button>
    </div>
  `;

  Modal.abrir({ titulo: 'Escolher item', conteudo });

  document.getElementById('btnCancelarEscolha').addEventListener('click', () => Modal.fechar());
  document.getElementById('btnConfirmarEscolha').addEventListener('click', async () => {
    const quantidade = Helpers.clamp(Number(document.getElementById('inputQuantidadeModal').value) || 1, 1, restante);

    if (!estado.participante) {
      Toast.erro('Confirme sua presença antes de escolher itens.');
      Modal.fechar();
      return;
    }

    const resultado = await EventoService.escolherItem(estado.participante.id, itemId, quantidade);
    Modal.fechar();

    if (!resultado.ok) {
      Toast.erro('Este item acabou de ficar indisponível.');
      await renderizarItens();
      return;
    }

    // Mantém a participante atualizada em memória e resincroniza a planilha.
    estado.participante = await DB.obterParticipante(estado.participante.id);
    Integracoes.enviarParaPlanilha(estado.participante, estado.participante.itensEscolhidos || []);

    Toast.sucesso(`${itemNome} adicionado à sua lista!`);
    await renderizarItens();
  });
}

function ligarEventosFormulario() {
  els.radiosParticipa.forEach((r) => r.addEventListener('change', atualizarPillsVisual));
  els.inputTelefone.addEventListener('input', (e) => {
    e.target.value = Helpers.formatarTelefone(e.target.value);
  });
  els.formConfirmacao.addEventListener('submit', aoEnviarConfirmacao);
}

async function iniciar() {
  mapearElementos();
  await DB.iniciar();
  await carregarEvento();
  ligarEventosFormulario();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {
      /* Falha silenciosa: app continua funcional sem SW. */
    });
  }
}

document.addEventListener('DOMContentLoaded', iniciar);
