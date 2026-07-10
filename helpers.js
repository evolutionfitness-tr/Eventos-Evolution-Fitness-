/**
 * helpers.js
 * Funções utilitárias genéricas, sem dependência de estado da aplicação.
 */

export const Helpers = {
  /** Gera um id único e legível. */
  gerarId(prefixo = 'id') {
    return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  },

  /** Formata telefone brasileiro enquanto o usuário digita. */
  formatarTelefone(valor) {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10) {
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
  },

  /** Valida se o telefone tem DDD + 8 ou 9 dígitos. */
  telefoneValido(valor) {
    const digitos = valor.replace(/\D/g, '');
    return digitos.length === 10 || digitos.length === 11;
  },

  /** Valida nome completo (ao menos duas palavras). */
  nomeValido(valor) {
    return valor.trim().split(/\s+/).filter(Boolean).length >= 2;
  },

  /** Formata data ISO para formato brasileiro legível. */
  formatarData(iso, comHora = true) {
    if (!iso) return '';
    const data = new Date(iso);
    const opcoesData = { day: '2-digit', month: 'long', year: 'numeric' };
    const dataFormatada = data.toLocaleDateString('pt-BR', opcoesData);
    if (!comHora) return dataFormatada;
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dataFormatada} às ${hora}`;
  },

  /** Escapa HTML para evitar injeção ao renderizar dados do usuário. */
  escapeHtml(texto = '') {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  },

  /** Limita a execução de uma função (debounce). */
  debounce(fn, atraso = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), atraso);
    };
  },

  /** Converte array de objetos em CSV, com aspas e separador seguros. */
  paraCSV(linhas, colunas) {
    const cabecalho = colunas.map((c) => `"${c.titulo}"`).join(';');
    const corpo = linhas
      .map((linha) =>
        colunas
          .map((c) => `"${String(linha[c.chave] ?? '').replace(/"/g, '""')}"`)
          .join(';')
      )
      .join('\n');
    return `${cabecalho}\n${corpo}`;
  },

  /** Dispara o download de um arquivo de texto no navegador. */
  baixarArquivo(nomeArquivo, conteudo, tipoMime = 'text/csv;charset=utf-8;') {
    const blob = new Blob(['\uFEFF' + conteudo], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /** Clamp numérico simples. */
  clamp(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
  },
};
