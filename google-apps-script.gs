/**
 * CÓDIGO PARA O GOOGLE APPS SCRIPT
 * ---------------------------------------------------------------------
 * Este arquivo não faz parte do site — ele é colado dentro do editor de
 * Apps Script vinculado à sua Planilha Google. Veja o passo a passo
 * completo no README.md, seção "Planilha do Google".
 * ---------------------------------------------------------------------
 */

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Participantes') || ss.insertSheet('Participantes');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Nome', 'Telefone', 'Participa', 'Acompanhantes', 'Itens', 'Observações', 'Confirmado em']);
  }

  var dados = JSON.parse(e.postData.contents);

  // Procura se este telefone já tem uma linha (evita duplicar quando o
  // aluno escolhe vários itens em momentos diferentes).
  var valores = sheet.getDataRange().getValues();
  var linhaExistente = -1;
  for (var i = 1; i < valores.length; i++) {
    if (String(valores[i][1]) === String(dados.telefone)) {
      linhaExistente = i + 1; // +1 porque getRange é 1-indexado
      break;
    }
  }

  var linha = [
    dados.nome || '',
    dados.telefone || '',
    dados.participa ? 'Sim' : 'Não',
    dados.acompanhantes || 0,
    dados.itens || '',
    dados.observacoes || '',
    dados.confirmadoEm || new Date().toLocaleString('pt-BR'),
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
