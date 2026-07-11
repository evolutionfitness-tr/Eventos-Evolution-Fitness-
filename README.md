# Evolution Eventos

Sistema de gestão de eventos da **Evolution Fitness Academia** (Três Rios, RJ).
Primeiro módulo do futuro aplicativo **Evolution Academia**. Construído em
HTML5, CSS3 e JavaScript ES6+ puro (sem frameworks), como PWA instalável e
funcional offline.

## Como rodar localmente

Este projeto usa módulos ES (`import`/`export`), então precisa ser servido
por um servidor HTTP — não abra `index.html` diretamente com `file://`.

```bash
# Qualquer servidor estático funciona. Exemplo com Python:
python3 -m http.server 8080

# Depois acesse:
# http://localhost:8080/index.html      -> tela pública do evento
# http://localhost:8080/admin.html      -> painel administrativo
```

Para publicar no GitHub Pages, basta subir a pasta `eventos/` inteira para
o repositório e ativar o Pages na branch desejada.

## Acesso administrativo

Senha padrão: `evolution2026`

A senha fica salva no `localStorage` do navegador (chave interna do
sistema). Para trocá-la, edite o valor padrão em `scripts/admin.js`
(constante `SENHA_PADRAO`) antes da primeira execução, ou implemente uma
tela de troca de senha futuramente.

> Nota: como o projeto ainda não tem um back-end, esta senha é uma barreira
> simples de acesso para a equipe — não substitui autenticação real. Ao
> migrar para Supabase, recomenda-se usar o Supabase Auth.

## Arquitetura de pastas

```
/eventos
  index.html          Tela pública (confirmação de presença + itens)
  admin.html          Painel administrativo
  manifest.json        Configuração do PWA
  service-worker.js    Cache offline (app shell)

  /style
    variables.css       Tokens de design (cores, tipografia, espaçamento)
    components.css      Componentes reutilizáveis (cards, botões, modal...)
    animations.css       Animações discretas (fade, slide, hover)
    style.css            Layout geral, importa os arquivos acima

  /scripts
    storage.js          Camada mais baixa: acesso direto ao localStorage
    database.js          Camada de dados: único arquivo a trocar ao migrar
                          para Supabase (todas as funções já são async)
    event.js              Regras de negócio: confirmação, escolha de itens,
                          estatísticas
    ui.js                  Funções puras de renderização (HTML)
    app.js                 Controlador da tela pública
    admin.js               Controlador do painel administrativo

  /utils
    helpers.js            Formatação, validação, CSV, debounce
    modal.js               Componente de modal reutilizável
    toast.js                Notificações temporárias

  /assets
    /logo, /icons, /images  Identidade visual (SVG)

  /data
    events.json, items.json, participants.json   Dados iniciais (seed)
```

## Planilha do Google e WhatsApp

Quando o aluno confirma presença e escolhe os itens, o sistema:

1. **Envia automaticamente para uma Planilha Google** (sem o aluno precisar
   apertar nada) — os dados aparecem/atualizam em tempo real numa aba
   chamada `Participantes`.
2. **Mostra um botão de WhatsApp** para o aluno enviar um resumo direto para
   o número da academia (o aluno decide se quer enviar).

Toda a configuração fica em `scripts/integracoes.js`, no topo do arquivo:

```js
const CONFIG = {
  GOOGLE_SHEETS_URL: 'COLE_AQUI_A_URL_DO_APPS_SCRIPT',
  WHATSAPP_NUMERO: '5524999999999', // TROCAR pelo número real da academia
};
```

### Configurando a Planilha do Google (uma única vez)

1. Crie uma Planilha Google nova (sheets.google.com)
2. Vá em **Extensões → Apps Script**
3. Apague o conteúdo padrão e cole o conteúdo do arquivo
   `google-apps-script.gs` (está na raiz deste projeto)
4. Clique em **Implantar → Nova implantação**
5. Em **Tipo**, escolha **App da Web**
6. Em **Executar como**, escolha **Eu** (sua conta)
7. Em **Quem pode acessar**, escolha **Qualquer pessoa**
8. Clique em **Implantar** e autorize as permissões pedidas
9. Copie a **URL do app da Web** gerada (termina em `/exec`)
10. Cole essa URL no lugar de `COLE_AQUI_A_URL_DO_APPS_SCRIPT` em
    `scripts/integracoes.js`, publique a alteração no GitHub

A partir daí, toda confirmação de presença cria ou atualiza automaticamente
uma linha na aba `Participantes` da sua planilha (nome, telefone,
participa, acompanhantes, itens escolhidos, observações e data).

> Se quiser trocar a URL depois, é só editar essa mesma constante — não
> precisa mexer em mais nada.

### Configurando o número de WhatsApp

Troque `WHATSAPP_NUMERO` pelo número da academia, só com dígitos, código do
país + DDD (ex.: `5524999999999` para um número do Rio de Janeiro). O botão
de WhatsApp abre o app do aluno com uma mensagem pronta, endereçada a esse
número — o aluno só precisa tocar em enviar.



Não é necessário alterar código. No painel administrativo:

1. Clique em **+ Novo evento**.
2. Preencha nome, tipo (ex.: Halloween, Natal, Churrasco, Desafio Fitness),
   descrição, data, local e status.
3. Cadastre os itens do evento na aba **Itens do evento**.
4. Marque o evento como **Ativo** para que ele apareça na tela pública
   (`index.html` sempre mostra o evento ativo mais recente).

## Migração futura para Supabase

Toda a lógica de dados está isolada em `scripts/database.js`. Todas as
funções exportadas em `DB` já retornam Promises. Para migrar:

1. Criar as tabelas `eventos`, `itens` e `participantes` no Supabase,
   espelhando os campos usados hoje (ver `data/*.json` como referência).
2. Reescrever o **corpo** de cada função de `database.js` para chamar
   `supabase.from('tabela').select()/.insert()/.update()/.delete()`,
   mantendo os mesmos nomes de função e formato de retorno.
3. Nenhum outro arquivo (`app.js`, `admin.js`, `event.js`, `ui.js`) precisa
   ser alterado.

## Funcionalidades já preparadas para o futuro

A arquitetura modular permite adicionar, sem reescrever o projeto:

- Login e área do aluno / área do professor (trocar o gate simples de
  `admin.js` por autenticação real)
- QR Code e check-in no evento
- Pagamento / PIX
- Integração com WhatsApp
- Push notifications
- Ranking, sistema de pontos e desafios
- Galeria de fotos e calendário de eventos

## Identidade visual

- Vermelho `#C8102E`, preto `#0D0D0D`, branco `#FFFFFF`, dourado `#C9A227`
  (usado apenas em pequenos destaques: anéis de progresso, bordas, ícones).
- Tipografia: **Fraunces** (display, títulos) + **Inter** (corpo/dados).
- Sem emojis, sem aparência infantil, interface limpa e mobile-first.
