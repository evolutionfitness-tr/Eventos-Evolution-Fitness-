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
  GOOGLE_SHEETS_URL: 'COLE_AQUI_A_URL_DO_APPS_SCRIPT',
  WHATSAPP_NUMERO: '5524999999999', // TROCAR pelo número real da academia
};

export const Integracoes = {
  /**
   * Envia (ou atualiza) a linha do participante na Planilha Google.
   * É "fire and forget": nunca trava nem quebra o fluxo do app caso a
   * planilha esteja indisponível ou ainda não configurada.
   */
  async enviarParaPlanilha(participante, itensEscolhidos = []) {
    if (!CONFIG.GOOGLE_SHEETS_URL || CONFIG.GOOGLE_SHEETS_URL.includes('COLE_AQUI')) {
      return; // Integração ainda não configurada — ignora silenciosamente.
    }

    const payload = {
      nome: participante.nome,
      telefone: participante.telefone,
      participa: participante.participa,
      acompanhantes: participante.acompanhantes || 0,
      itens: itensEscolhidos.map((i) => `${i.nome} (${i.quantidade})`).join(', '),
      observacoes: participante.observacoes || '',
      confirmadoEm: new Date().toLocaleString('pt-BR'),
    };

    try {
      // Content-Type "text/plain" evita o preflight CORS que o Apps Script
      // não trata bem. O script do lado do Google lê e faz JSON.parse.
      await fetch(CONFIG.GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
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
