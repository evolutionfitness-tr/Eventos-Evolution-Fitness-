<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Painel Administrativo — Evolution Eventos</title>
<meta name="theme-color" content="#0D0D0D" />
<link rel="manifest" href="manifest.json" />
<link rel="icon" href="assets/icons/icon-192.svg" />
<link rel="stylesheet" href="style/style.css" />
<style>
  /* Estilos específicos do painel administrativo (layout de app, não do site público) */
  .admin-shell { display: flex; min-height: 100vh; }
  .admin-sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--color-black);
    color: var(--color-white);
    padding: var(--space-5) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .admin-sidebar__brand { display: flex; align-items: center; gap: var(--space-2); }
  .admin-sidebar__brand img { height: 28px; }
  .admin-sidebar__brand span { font-family: var(--font-display); font-weight: 600; }
  .admin-nav { display: flex; flex-direction: column; gap: var(--space-1); }
  .admin-nav button {
    text-align: left;
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    font-size: var(--fs-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-standard);
  }
  .admin-nav button:hover { background: rgba(255,255,255,0.06); color: var(--color-white); }
  .admin-nav button.is-ativo { background: var(--color-red); color: var(--color-white); }
  .admin-main { flex: 1; padding: var(--space-6); max-width: 100%; overflow-x: hidden; }
  .admin-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6); }
  .toolbar { display: flex; gap: var(--space-3); flex-wrap: wrap; margin-bottom: var(--space-4); align-items: center; }
  .toolbar input[type="text"] { max-width: 280px; }
  @media (max-width: 780px) {
    .admin-shell { flex-direction: column; }
    .admin-sidebar { width: 100%; flex-direction: row; overflow-x: auto; align-items: center; }
    .admin-nav { flex-direction: row; }
  }
  @media print {
    .admin-sidebar, .admin-topbar, .toolbar, #secaoDashboard, #secaoItens { display: none !important; }
    .admin-main { padding: 0; }
  }
</style>
</head>
<body>

<!-- ==================== TELA DE LOGIN ==================== -->
<div class="auth-screen" id="telaLogin">
  <div class="auth-card anim-scale-in">
    <div class="auth-card__logo"><img src="assets/logo/logo.svg" alt="Evolution Fitness Studio" /></div>
    <h1 class="auth-card__title">Painel Administrativo</h1>
    <p class="auth-card__subtitle">Evolution Eventos &middot; acesso restrito à equipe</p>
    <form id="formLogin">
      <div class="field">
        <label for="inputSenha">Senha de acesso</label>
        <input type="password" id="inputSenha" required autofocus />
        <span class="field-error-msg" id="erroLogin">Senha incorreta. Tente novamente.</span>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Entrar</button>
    </form>
  </div>
</div>

<!-- ==================== PAINEL ADMINISTRATIVO ==================== -->
<div class="admin-shell u-hidden" id="telaPainel">
  <aside class="admin-sidebar">
    <div class="admin-sidebar__brand">
      <img src="assets/logo/logo.svg" alt="" />
      <span>Evolution</span>
    </div>
    <nav class="admin-nav">
      <button type="button" data-secao-alvo="dashboard" class="is-ativo">Dashboard</button>
      <button type="button" data-secao-alvo="itens">Itens do evento</button>
      <button type="button" data-secao-alvo="participantes">Participantes</button>
    </nav>
    <button type="button" class="btn btn-outline btn-sm" id="btnSair" style="margin-top: auto; border-color: rgba(255,255,255,0.3); color: rgba(255,255,255,0.8);">Sair</button>
  </aside>

  <main class="admin-main">
    <div class="admin-topbar">
      <div class="u-flex u-gap-2" style="align-items: center;">
        <label for="seletorEvento" style="font-weight:600; font-size: var(--fs-sm);">Evento:</label>
        <select id="seletorEvento" style="min-height:40px; border-radius: var(--radius-sm); border:1.5px solid var(--color-border); padding: 0 12px;"></select>
      </div>
      <button type="button" class="btn btn-dark btn-sm" id="btnNovoEvento">+ Novo evento</button>
    </div>

    <!-- ---------- DASHBOARD ---------- -->
    <section data-secao="dashboard">
      <h2 class="section-title">Visão geral</h2>
      <div class="stats-grid" id="gradeStats"></div>

      <h3 class="section-title" style="font-size: var(--fs-lg);">Status dos itens</h3>
      <div class="items-grid" id="listaItensStatus"></div>
    </section>

    <!-- ---------- ITENS ---------- -->
    <section data-secao="itens" class="u-hidden">
      <div class="admin-topbar">
        <h2 class="section-title" style="margin:0;">Itens do evento</h2>
        <button type="button" class="btn btn-primary btn-sm" id="btnNovoItem">+ Novo item</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Item</th><th>Necessário</th><th>Escolhido</th><th>Restante</th><th>Ações</th></tr>
          </thead>
          <tbody id="tabelaItensBody"></tbody>
        </table>
      </div>
    </section>

    <!-- ---------- PARTICIPANTES ---------- -->
    <section data-secao="participantes" class="u-hidden">
      <h2 class="section-title">Participantes</h2>
      <div class="toolbar">
        <input type="text" id="inputBuscaParticipante" placeholder="Buscar por nome ou telefone..." />
        <button type="button" class="btn btn-outline btn-sm" id="btnExportarCSV">Exportar CSV</button>
        <button type="button" class="btn btn-outline btn-sm" id="btnImprimir">Imprimir relatório</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Nome</th><th>Telefone</th><th>Status</th><th>Acompanhantes</th><th>Itens</th><th>Observações</th><th>Ações</th></tr>
          </thead>
          <tbody id="tabelaParticipantesBody"></tbody>
        </table>
      </div>
    </section>
  </main>
</div>

<script type="module" src="scripts/admin.js"></script>
</body>
</html>
