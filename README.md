# Evolution Eventos

Sistema de gestão de eventos da **Evolution Fitness Studio** (Três Rios, RJ).
Primeiro módulo do futuro aplicativo **Evolution Studio**. Construído em
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

## Adicionando um novo evento

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
