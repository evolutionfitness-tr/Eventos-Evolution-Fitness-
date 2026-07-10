/**
 * storage.js
 * Camada de baixo nível sobre o localStorage.
 * Nenhuma outra parte do sistema deve chamar localStorage diretamente:
 * tudo passa por aqui, para que no futuro baste trocar esta camada
 * (ex.: IndexedDB ou uma API remota) sem alterar o restante do código.
 */

const PREFIXO = 'evolutionEventos::';

export const Storage = {
  ler(chave, valorPadrao = null) {
    try {
      const bruto = localStorage.getItem(PREFIXO + chave);
      if (bruto === null) return valorPadrao;
      return JSON.parse(bruto);
    } catch (erro) {
      console.error(`[Storage] Falha ao ler "${chave}":`, erro);
      return valorPadrao;
    }
  },

  gravar(chave, valor) {
    try {
      localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      console.error(`[Storage] Falha ao gravar "${chave}":`, erro);
      return false;
    }
  },

  remover(chave) {
    localStorage.removeItem(PREFIXO + chave);
  },

  limparTudo() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIXO))
      .forEach((k) => localStorage.removeItem(k));
  },
};
