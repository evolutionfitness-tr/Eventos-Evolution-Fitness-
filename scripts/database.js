/**
 * database.js
 * -----------------------------------------------------------------------
 * Camada de dados da aplicação. Toda a lógica de negócio (event.js, app.js,
 * admin.js) fala apenas com este arquivo — nunca diretamente com o Storage.
 *
 * MIGRAÇÃO FUTURA PARA SUPABASE:
 * Todas as funções abaixo já são assíncronas (retornam Promises) mesmo
 * usando localStorage. Isso significa que, quando o projeto crescer, basta
 * reescrever o CORPO de cada função para chamar a API do Supabase
 * (ex.: `supabase.from('eventos').select()`), mantendo os MESMOS nomes de
 * função e o MESMO formato de retorno. Nenhum outro arquivo precisa mudar.
 * -----------------------------------------------------------------------
 */

import { Storage } from './storage.js';
import { Helpers } from '../utils/helpers.js';

const CHAVE_EVENTOS = 'eventos';
const CHAVE_ITENS = 'itens';
const CHAVE_PARTICIPANTES = 'participantes';

/**
 * Sincroniza eventos e itens com os arquivos JSON toda vez que o app abre.
 *
 * Diferente de um "seed único", isso SEMPRE busca a versão mais recente de
 * data/events.json e data/items.json e atualiza nome, descrição, data,
 * local e quantidades necessárias — assim, uma edição feita nesses arquivos
 * aparece para qualquer pessoa que abrir o site, mesmo que o aparelho dela
 * já tivesse dados salvos de antes.
 *
 * O que NÃO é sobrescrito (fica só no aparelho de cada pessoa):
 * - quantas unidades de cada item já foram escolhidas (itens.escolhido)
 * - a lista de participantes/confirmações
 * - eventos ou itens criados manualmente pelo painel admin (sem
 *   correspondência nos arquivos JSON) continuam existindo
 */
async function sincronizarComJSON() {
  let eventosJSON = null;
  let itensJSON = null;

  try {
    [eventosJSON, itensJSON] = await Promise.all([
      fetch('data/events.json').then((r) => r.json()),
      fetch('data/items.json').then((r) => r.json()),
    ]);
  } catch (erro) {
    console.warn('[database] JSON indisponível agora — usando dados já salvos no aparelho.', erro);
  }

  // Garante que participantes.json ao menos inicializa vazio na primeira vez.
  if (Storage.ler(CHAVE_PARTICIPANTES) === null) {
    let participantesJSON = [];
    try {
      participantesJSON = await fetch('data/participants.json').then((r) => r.json());
    } catch (erro) {
      /* Segue com array vazio se não conseguir buscar. */
    }
    Storage.gravar(CHAVE_PARTICIPANTES, participantesJSON);
  }

  if (eventosJSON) {
    const eventosLocais = Storage.ler(CHAVE_EVENTOS, []);
    const porId = new Map(eventosLocais.map((e) => [e.id, e]));
    eventosJSON.forEach((eventoNovo) => porId.set(eventoNovo.id, eventoNovo));
    Storage.gravar(CHAVE_EVENTOS, Array.from(porId.values()));
  } else if (Storage.ler(CHAVE_EVENTOS) === null) {
    Storage.gravar(CHAVE_EVENTOS, []);
  }

  if (itensJSON) {
    const itensLocais = Storage.ler(CHAVE_ITENS, []);
    const escolhidosPorId = new Map(itensLocais.map((i) => [i.id, i.escolhido || 0]));

    const itensAtualizados = itensJSON.map((itemNovo) => ({
      ...itemNovo,
      escolhido: escolhidosPorId.has(itemNovo.id) ? escolhidosPorId.get(itemNovo.id) : (itemNovo.escolhido || 0),
    }));

    // Preserva itens criados manualmente pelo admin que não existem no JSON.
    const idsNoJSON = new Set(itensJSON.map((i) => i.id));
    itensLocais.forEach((itemLocal) => {
      if (!idsNoJSON.has(itemLocal.id)) itensAtualizados.push(itemLocal);
    });

    Storage.gravar(CHAVE_ITENS, itensAtualizados);
  } else if (Storage.ler(CHAVE_ITENS) === null) {
    Storage.gravar(CHAVE_ITENS, []);
  }
}

export const DB = {
  async iniciar() {
    await sincronizarComJSON();
  },

  /* ==================== EVENTOS ==================== */

  async listarEventos() {
    return Storage.ler(CHAVE_EVENTOS, []);
  },

  async obterEvento(id) {
    const eventos = Storage.ler(CHAVE_EVENTOS, []);
    return eventos.find((e) => e.id === id) || null;
  },

  /** Retorna o evento ativo mais recente (o exibido na tela pública). */
  async obterEventoAtivo() {
    const eventos = Storage.ler(CHAVE_EVENTOS, []);
    const ativos = eventos.filter((e) => e.status === 'ativo');
    if (ativos.length === 0) return null;
    return ativos.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))[0];
  },

  async criarEvento(dados) {
    const eventos = Storage.ler(CHAVE_EVENTOS, []);
    const novo = {
      id: Helpers.gerarId('evento'),
      status: 'ativo',
      criadoEm: new Date().toISOString(),
      ...dados,
    };
    eventos.push(novo);
    Storage.gravar(CHAVE_EVENTOS, eventos);
    return novo;
  },

  async atualizarEvento(id, dados) {
    const eventos = Storage.ler(CHAVE_EVENTOS, []);
    const idx = eventos.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    eventos[idx] = { ...eventos[idx], ...dados };
    Storage.gravar(CHAVE_EVENTOS, eventos);
    return eventos[idx];
  },

  async excluirEvento(id) {
    const eventos = Storage.ler(CHAVE_EVENTOS, []).filter((e) => e.id !== id);
    Storage.gravar(CHAVE_EVENTOS, eventos);
    const itens = Storage.ler(CHAVE_ITENS, []).filter((i) => i.eventoId !== id);
    Storage.gravar(CHAVE_ITENS, itens);
    const participantes = Storage.ler(CHAVE_PARTICIPANTES, []).filter((p) => p.eventoId !== id);
    Storage.gravar(CHAVE_PARTICIPANTES, participantes);
    return true;
  },

  /* ==================== ITENS ==================== */

  async listarItensPorEvento(eventoId) {
    return Storage.ler(CHAVE_ITENS, []).filter((i) => i.eventoId === eventoId);
  },

  async criarItem(dados) {
    const itens = Storage.ler(CHAVE_ITENS, []);
    const novo = { id: Helpers.gerarId('item'), escolhido: 0, ...dados };
    itens.push(novo);
    Storage.gravar(CHAVE_ITENS, itens);
    return novo;
  },

  async atualizarItem(id, dados) {
    const itens = Storage.ler(CHAVE_ITENS, []);
    const idx = itens.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    itens[idx] = { ...itens[idx], ...dados };
    Storage.gravar(CHAVE_ITENS, itens);
    return itens[idx];
  },

  async excluirItem(id) {
    const itens = Storage.ler(CHAVE_ITENS, []).filter((i) => i.id !== id);
    Storage.gravar(CHAVE_ITENS, itens);
    return true;
  },

  /**
   * Reserva uma quantidade de um item para um participante.
   * Retorna { ok, item, motivo } — nunca ultrapassa o necessário (condição de corrida simples).
   */
  async reservarItem(itemId, quantidade) {
    const itens = Storage.ler(CHAVE_ITENS, []);
    const idx = itens.findIndex((i) => i.id === itemId);
    if (idx === -1) return { ok: false, motivo: 'item-nao-encontrado' };

    const item = itens[idx];
    const restante = item.necessario - item.escolhido;
    if (restante <= 0) return { ok: false, motivo: 'esgotado', item };
    const quantidadeFinal = Math.min(quantidade, restante);

    itens[idx] = { ...item, escolhido: item.escolhido + quantidadeFinal };
    Storage.gravar(CHAVE_ITENS, itens);
    return { ok: true, item: itens[idx], quantidadeReservada: quantidadeFinal };
  },

  /** Libera (desfaz) uma reserva de item, usado ao editar/excluir participante. */
  async liberarItem(itemId, quantidade) {
    const itens = Storage.ler(CHAVE_ITENS, []);
    const idx = itens.findIndex((i) => i.id === itemId);
    if (idx === -1) return { ok: false };
    const item = itens[idx];
    itens[idx] = { ...item, escolhido: Math.max(0, item.escolhido - quantidade) };
    Storage.gravar(CHAVE_ITENS, itens);
    return { ok: true, item: itens[idx] };
  },

  /* ==================== PARTICIPANTES ==================== */

  async listarParticipantesPorEvento(eventoId) {
    return Storage.ler(CHAVE_PARTICIPANTES, []).filter((p) => p.eventoId === eventoId);
  },

  async obterParticipante(id) {
    return Storage.ler(CHAVE_PARTICIPANTES, []).find((p) => p.id === id) || null;
  },

  /** Busca participante pelo telefone dentro de um evento (evita duplicidade). */
  async obterParticipantePorTelefone(eventoId, telefone) {
    return (
      Storage.ler(CHAVE_PARTICIPANTES, []).find(
        (p) => p.eventoId === eventoId && p.telefone === telefone
      ) || null
    );
  },

  async criarParticipante(dados) {
    const participantes = Storage.ler(CHAVE_PARTICIPANTES, []);
    const novo = {
      id: Helpers.gerarId('part'),
      criadoEm: new Date().toISOString(),
      itensEscolhidos: [], // [{ itemId, nome, quantidade }]
      ...dados,
    };
    participantes.push(novo);
    Storage.gravar(CHAVE_PARTICIPANTES, participantes);
    return novo;
  },

  async atualizarParticipante(id, dados) {
    const participantes = Storage.ler(CHAVE_PARTICIPANTES, []);
    const idx = participantes.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    participantes[idx] = { ...participantes[idx], ...dados };
    Storage.gravar(CHAVE_PARTICIPANTES, participantes);
    return participantes[idx];
  },

  async excluirParticipante(id) {
    const participantes = Storage.ler(CHAVE_PARTICIPANTES, []);
    const alvo = participantes.find((p) => p.id === id);
    if (alvo) {
      // Libera os itens reservados por este participante antes de excluir.
      for (const escolha of alvo.itensEscolhidos || []) {
        await this.liberarItem(escolha.itemId, escolha.quantidade);
      }
    }
    Storage.gravar(
      CHAVE_PARTICIPANTES,
      participantes.filter((p) => p.id !== id)
    );
    return true;
  },
};
