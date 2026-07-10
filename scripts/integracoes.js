/**
 * integracoes.js
 * Envia a confirmação de presença para uma Planilha Google (via Google Apps
 * Script) e monta o link do WhatsApp para o aluno notificar a academia.
 *
 * ⚠️ CONFIGURAÇÃO OBRIGATÓRIA (feita uma única vez pela equipe):
 * 1. GOOGLE_SHEETS_URL — cole aqui a URL do Web App do Google Apps Script
 *    (veja o passo a passo no README.md, seção "Planilha do Google").
 * 2. WHATSAPP_NUMERO — número de WhatsApp da Evolution Fitness Studio,
 *    com código do país e DDD, apenas dígitos. Ex.: 5524999999999
 */

const CONFIG = {
  GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/AKfycBwiy1NMsyumCpQLQajTil84hrji733itN358Chw0NDBEtdiBrzdMRhxCHOrXnVK2Ek/exec',
  WHATSAPP_NUMERO: '5524981433380'
};

export const Integracoes = {
  /**
   * Envia (ou atualiza) a linha do participante na Planilha Google.
   * É "fire and forget": nunca trava nem quebra o fluxo do app caso a
   * planilha esteja indisponível ou ainda não configurada.
   *
   * Usa GET com parâmetros na URL (em vez de POST com corpo) porque o
   * Google Apps Script redireciona internamente toda chamada ao Web App,
   * e esse redirecionamento converte POST em GET — descartando o corpo
   * da requisição no caminho. Parâmetros de URL sobrevivem ao redirect.
   */
  async enviarParaPlanilha(participante, itensEscolhidos = []) {
    if (!CONFIG.GOOGLE_SHEETS_URL || CONFIG.GOOGLE_SHEETS_URL.includes('COLE_AQUI')) {
      return; // Integração ainda não configurada — ignora silenciosamente.
    }

    const parametros = new URLSearchParams({
      nome: participante.nome || '',
      telefone: participante.telefone || '',
      participa: participante.participa ? 'Sim' : 'Não',
      acompanhantes: String(participante.acompanhantes || 0),
      itens: itensEscolhidos.map((i) => `${i.nome} (${i.quantidade})`).join(', '),
      observacoes: participante.observacoes || '',
      confirmadoEm: new Date().toLocaleString('pt-BR'),
    });

    try {
      await fetch(`${CONFIG.GOOGLE_SHEETS_URL}?${parametros.toString()}`, {
        method: 'GET',
        mode: 'no-cors',
      });
    } catch (erro) {
      console.warn('[integracoes] Falha ao enviar para a planilha (será ignorado):', erro);
    }
  },

  /** Monta o link do WhatsApp com a confirmação pronta para o aluno enviar. */
  linkWhatsApp(participante, itensEscolhidos = [], nomeEvento = '') {
    const linhas = [
      `Confirmação de presença — ${nomeEvento}`,
      '',
      `Nome: ${participante.nome}`,
      `Telefone: ${participante.telefone}`,
      `Participa: ${participante.participa ? 'Sim' : 'Não'}`,
    ];

    if (participante.participa) {
      linhas.push(`Acompanhantes: ${participante.acompanhantes || 0}`);
      linhas.push(
        `Itens que vou levar: ${
          itensEscolhidos.length
            ? itensEscolhidos.map((i) => `${i.nome} (${i.quantidade})`).join(', ')
            : 'nenhum ainda'
        }`
      );
    }
    if (participante.observacoes) {
      linhas.push(`Observações: ${participante.observacoes}`);
    }

    const texto = encodeURIComponent(linhas.join('\n'));
    return `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${texto}`;
  },

  /** Abre o WhatsApp do aluno com a mensagem pronta (o aluno decide enviar). */
  abrirWhatsApp(participante, itensEscolhidos = [], nomeEvento = '') {
    const link = this.linkWhatsApp(participante, itensEscolhidos, nomeEvento);
    window.open(link, '_blank');
  },
};
