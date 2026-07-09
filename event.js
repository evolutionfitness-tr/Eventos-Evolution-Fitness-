/**
 * event.js
 * Regras de negócio do domínio "evento": confirmação de presença,
 * escolha de itens e cálculo de estatísticas. Usado por app.js (área
 * pública) e admin.js (dashboard).
 */

import { DB } from './database.js';
import { Helpers } from '../utils/helpers.js';

export const EventoService = {
  /**
   * Confirma presença de um participante. Se o telefone já confirmou
   * presença neste evento, atualiza o registro existente em vez de duplicar.
   */
  async confirmarPresenca(eventoId, dadosFormulario) {
    const existente = await DB.obterParticipantePorTelefone(eventoId, dadosFormulario.telefone);
    const payload = {
      eventoId,
      nome: dadosFormulario.nome.trim(),
      telefone: dadosFormulario.telefone,
      participa: dadosFormulario.participa,
      acompanhantes: Number(dadosFormulario.acompanhantes) || 0,
      observacoes: (dadosFormulario.observacoes || '').trim(),
    };

    if (existente) {
      return DB.atualizarParticipante(existente.id, payload);
    }
    return DB.criarParticipante(payload);
  },

  /** Associa a escolha de um item a um participante, respeitando o limite. */
  async escolherItem(participanteId, itemId, quantidade) {
    const participante = await DB.obterParticipante(participanteId);
    if (!participante) return { ok: false, motivo: 'participante-nao-encontrado' };

    const reserva = await DB.reservarItem(itemId, quantidade);
    if (!reserva.ok) return reserva;

    const itensEscolhidos = [...(participante.itensEscolhidos || [])];
    const idxExistente = itensEscolhidos.findIndex((i) => i.itemId === itemId);
    if (idxExistente > -1) {
      itensEscolhidos[idxExistente].quantidade += reserva.quantidadeReservada;
    } else {
      itensEscolhidos.push({
        itemId,
        nome: reserva.item.nome,
        quantidade: reserva.quantidadeReservada,
      });
    }

    await DB.atualizarParticipante(participanteId, { itensEscolhidos });
    return { ok: true, item: reserva.item, quantidadeReservada: reserva.quantidadeReservada };
  },

  /** Calcula as estatísticas completas de um evento para o dashboard admin. */
  async calcularEstatisticas(eventoId) {
    const [participantes, itens] = await Promise.all([
      DB.listarParticipantesPorEvento(eventoId),
      DB.listarItensPorEvento(eventoId),
    ]);

    const confirmados = participantes.filter((p) => p.participa === true);
    const naoIrao = participantes.filter((p) => p.participa === false);
    const totalAcompanhantes = confirmados.reduce((soma, p) => soma + (p.acompanhantes || 0), 0);

    const itensCompletos = itens.filter((i) => i.escolhido >= i.necessario);
    const itensFaltando = itens.filter((i) => i.escolhido < i.necessario);

    return {
      totalConvidados: participantes.length,
      confirmados: confirmados.length,
      naoIrao: naoIrao.length,
      totalAcompanhantes,
      totalGeralPessoas: confirmados.length + totalAcompanhantes,
      itens: itens.map((i) => ({
        ...i,
        restante: Math.max(0, i.necessario - i.escolhido),
        pct: i.necessario > 0 ? Math.round((i.escolhido / i.necessario) * 100) : 0,
      })),
      itensCompletos: itensCompletos.length,
      itensFaltando: itensFaltando.length,
    };
  },

  /** Monta linhas prontas para exportação (CSV/impressão) dos participantes. */
  async listarParaExportacao(eventoId) {
    const participantes = await DB.listarParticipantesPorEvento(eventoId);
    return participantes.map((p) => ({
      nome: p.nome,
      telefone: p.telefone,
      participa: p.participa ? 'Sim' : 'Não',
      acompanhantes: p.acompanhantes,
      itens: (p.itensEscolhidos || []).map((i) => `${i.nome} (${i.quantidade})`).join(', '),
      observacoes: p.observacoes || '',
      confirmadoEm: Helpers.formatarData(p.criadoEm),
    }));
  },
};
