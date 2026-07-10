/**
 * CÓDIGO PARA O GOOGLE APPS SCRIPT
 * ---------------------------------------------------------------------
 * Este arquivo não faz parte do site — ele é colado dentro de um projeto
 * de Apps Script (script.google.com → Novo projeto). Veja o passo a passo
 * completo no README.md, seção "Planilha do Google".
 *
 * ⚠️ Usa doGet (não doPost) de propósito: o Web App do Apps Script
 * redireciona toda chamada internamente, e esse redirecionamento converte
 * POST em GET, descartando o corpo da requisição. Recebendo os dados como
 * parâmetros de URL (GET), nada se perde no caminho.
 * ---------------------------------------------------------------------
 */

// ID da planilha "Lista de..." (Evolution Eventos — Arraiá 2026)
var ID_DA_PLANILHA = '1ZU7o7AM2bE14oW2YwF4ml6F8UB3wI5aKujTzRUz2Uw0';

function doGet(e) {
  var ss = SpreadsheetApp.openById(ID_DA_PLANILHA);
  var sheet = ss.getSheetByName('Participantes') || ss.insertSheet('Participantes');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Nome', 'Telefone', 'Participa', 'Acompanhantes', 'Itens', 'Observações', 'Confirmado em']);
  }

  var p = e.parameter || {};

  // Procura se este telefone já tem uma linha (evita duplicar quando o
  // aluno escolhe vários itens em momentos diferentes).
  var valores = sheet.getDataRange().getValues();
  var linhaExistente = -1;
  for (var i = 1; i < valores.length; i++) {
    if (String(valores[i][1]) === String(p.telefone)) {
      linhaExistente = i + 1; // +1 porque getRange é 1-indexado
      break;
    }
  }

  var linha = [
    p.nome || '',
    p.telefone || '',
    p.participa || '',
    p.acompanhantes || 0,
    p.itens || '',
    p.observacoes || '',
    p.confirmadoEm || new Date().toLocaleString('pt-BR'),
  ];

  if (linhaExistente > 0) {
    sheet.getRange(linhaExistente, 1, 1, linha.length).setValues([linha]);
  } else {
    sheet.appendRow(linha);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
