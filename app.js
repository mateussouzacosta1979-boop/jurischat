const STORAGE_KEY = 'npc-intranet-v2';

const permissionLabels = {
  dashboard: 'Acessar dashboard',
  avisos: 'Ver avisos',
  agenda: 'Acessar agenda',
  venda: 'Acessar módulo Venda',
  vendaMateriais: 'Ver materiais de venda',
  vendaDocumentos: 'Ver documentos de venda',
  vendaCampanhas: 'Ver campanhas de venda',
  vendaRanking: 'Ver ranking de venda',
  locacao: 'Acessar módulo Locação',
  locacaoMateriais: 'Ver materiais de locação',
  locacaoDocumentos: 'Ver documentos de locação',
  locacaoVistorias: 'Ver vistorias',
  locacaoOcorrencias: 'Ver manutenção/ocorrências',
  treinamentos: 'Acessar treinamentos',
  procedimentos: 'Ver procedimentos',
  scripts: 'Ver scripts comerciais',
  links: 'Ver links úteis',
  suporte: 'Abrir suporte interno',
  usuarios: 'Gerenciar usuários',
  configuracoes: 'Acessar configurações'
};

const defaultUsers = [
  {
    id: 'u-admin',
    name: 'Administrador',
    username: 'admin',
    password: '1234',
    role: 'Administrador geral',
    department: 'Venda e Locação',
    active: true,
    permissions: Object.fromEntries(Object.keys(permissionLabels).map(key => [key, true]))
  },
  {
    id: 'u-venda',
    name: 'Corretor Venda',
    username: 'venda',
    password: '1234',
    role: 'Corretor',
    department: 'Venda',
    active: true,
    permissions: {
      dashboard: true, avisos: true, agenda: true,
      venda: true, vendaMateriais: true, vendaDocumentos: true, vendaCampanhas: true, vendaRanking: false,
      locacao: false, locacaoMateriais: false, locacaoDocumentos: false, locacaoVistorias: false, locacaoOcorrencias: false,
      treinamentos: true, procedimentos: true, scripts: true, links: true, suporte: true,
      usuarios: false, configuracoes: false
    }
  },
  {
    id: 'u-locacao',
    name: 'Corretor Locação',
    username: 'locacao',
    password: '1234',
    role: 'Corretor',
    department: 'Locação',
    active: true,
    permissions: {
      dashboard: true, avisos: true, agenda: true,
      venda: false, vendaMateriais: false, vendaDocumentos: false, vendaCampanhas: false, vendaRanking: false,
      locacao: true, locacaoMateriais: true, locacaoDocumentos: true, locacaoVistorias: true, locacaoOcorrencias: true,
      treinamentos: true, procedimentos: true, scripts: true, links: true, suporte: true,
      usuarios: false, configuracoes: false
    }
  }
];

const pageMeta = {
  dashboard: ['Dashboard', 'Resumo da operação e atalhos principais'],
  avisos: ['Avisos', 'Comunicados internos e ciência da equipe'],
  agenda: ['Agenda', 'Eventos, plantões, treinamentos e compromissos'],
  venda: ['Venda', 'Central de empreendimentos, campanhas e materiais'],
  vendaMateriais: ['Materiais de Venda', 'Artes, PDFs, tabelas e mensagens prontas'],
  vendaDocumentos: ['Documentos de Venda', 'Checklists, propostas e modelos comerciais'],
  vendaCampanhas: ['Campanhas de Venda', 'Ações comerciais ativas e materiais de divulgação'],
  vendaRanking: ['Ranking de Venda', 'Indicadores e desempenho comercial'],
  locacao: ['Locação', 'Central de imóveis, vistorias e contratos de aluguel'],
  locacaoMateriais: ['Materiais de Locação', 'Materiais para atendimento e captação de locação'],
  locacaoDocumentos: ['Documentos de Locação', 'Fichas, propostas, contratos e checklists'],
  locacaoVistorias: ['Vistorias', 'Entrada, saída e acompanhamento de imóveis'],
  locacaoOcorrencias: ['Manutenção/Ocorrências', 'Controle de chamados e pendências locatícias'],
  treinamentos: ['Treinamentos', 'Integração e capacitação da equipe'],
  procedimentos: ['Procedimentos', 'Manuais internos e passo a passo operacional'],
  scripts: ['Scripts Comerciais', 'Mensagens prontas e respostas para objeções'],
  links: ['Links Úteis', 'Atalhos importantes da operação'],
  suporte: ['Suporte Interno', 'Solicitações, dúvidas e problemas internos'],
  usuarios: ['Usuários e Permissões', 'Cadastro e controle de acesso por checkbox'],
  configuracoes: ['Configurações', 'Identidade visual, módulos e preferências da intranet']
};

let state = loadState();
let currentUser = null;
let currentPage = 'dashboard';

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { users: defaultUsers };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.users) return { users: defaultUsers };
    return parsed;
  } catch {
    return { users: defaultUsers };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function has(permission) {
  return Boolean(currentUser?.permissions?.[permission]);
}

function login(username, password) {
  const user = state.users.find(u => u.username === username && u.password === password && u.active);
  if (!user) return false;
  currentUser = JSON.parse(JSON.stringify(user));
  currentPage = has('dashboard') ? 'dashboard' : firstAllowedPage();
  showApp();
  return true;
}

function firstAllowedPage() {
  return Object.keys(pageMeta).find(key => has(key)) || 'links';
}

function showApp() {
  document.getElementById('loginView').classList.add('hidden');
  document.getElementById('appView').classList.remove('hidden');
  document.getElementById('currentUserName').textContent = currentUser.name;
  document.getElementById('currentUserRole').textContent = `${currentUser.role} • ${currentUser.department}`;
  renderMenu();
  renderPage(currentPage);
}

function logout() {
  currentUser = null;
  document.getElementById('appView').classList.add('hidden');
  document.getElementById('loginView').classList.remove('hidden');
  document.getElementById('loginForm').reset();
}

function menuButton(page, label) {
  if (!has(page)) return '';
  return `<button class="menu-item ${currentPage === page ? 'active' : ''}" onclick="renderPage('${page}')">${label}</button>`;
}

function renderMenu() {
  const menu = document.getElementById('menu');
  menu.innerHTML = `
    <div class="menu-group-title">Geral</div>
    ${menuButton('dashboard', 'Dashboard')}
    ${menuButton('avisos', 'Avisos')}
    ${menuButton('agenda', 'Agenda')}

    ${has('venda') ? '<div class="menu-group-title">Venda</div>' : ''}
    ${menuButton('venda', 'Painel de Venda')}
    ${menuButton('vendaMateriais', 'Materiais')}
    ${menuButton('vendaDocumentos', 'Documentos')}
    ${menuButton('vendaCampanhas', 'Campanhas')}
    ${menuButton('vendaRanking', 'Ranking')}

    ${has('locacao') ? '<div class="menu-group-title">Locação</div>' : ''}
    ${menuButton('locacao', 'Painel de Locação')}
    ${menuButton('locacaoMateriais', 'Materiais')}
    ${menuButton('locacaoDocumentos', 'Documentos')}
    ${menuButton('locacaoVistorias', 'Vistorias')}
    ${menuButton('locacaoOcorrencias', 'Ocorrências')}

    <div class="menu-group-title">Operação</div>
    ${menuButton('treinamentos', 'Treinamentos')}
    ${menuButton('procedimentos', 'Procedimentos')}
    ${menuButton('scripts', 'Scripts')}
    ${menuButton('links', 'Links Úteis')}
    ${menuButton('suporte', 'Suporte')}

    ${has('usuarios') || has('configuracoes') ? '<div class="menu-group-title">Administração</div>' : ''}
    ${menuButton('usuarios', 'Usuários')}
    ${menuButton('configuracoes', 'Configurações')}
  `;
}

function renderPage(page) {
  if (!has(page)) {
    currentPage = firstAllowedPage();
  } else {
    currentPage = page;
  }

  const [title, subtitle] = pageMeta[currentPage];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = subtitle;
  renderMenu();

  const content = document.getElementById('content');
  const renderers = {
    dashboard: renderDashboard,
    avisos: () => renderSimpleList('Avisos importantes', [
      ['Plantão especial', 'Organização de equipe para o próximo sábado.'],
      ['Nova campanha ativa', 'Use os materiais atualizados nos atendimentos.'],
      ['Atualização de documentos', 'Modelos de proposta foram revisados.']
    ]),
    agenda: () => renderSimpleList('Agenda da semana', [
      ['Segunda, 09h', 'Reunião comercial geral'],
      ['Quarta, 15h', 'Treinamento de locação'],
      ['Sábado, 10h', 'Plantão de vendas']
    ]),
    venda: renderVenda,
    vendaMateriais: () => renderMaterials('Venda', ['Tabela de valores', 'Folder do empreendimento', 'Mensagem pronta para WhatsApp', 'Arte para Instagram']),
    vendaDocumentos: () => renderMaterials('Documentos de Venda', ['Checklist comprador', 'Modelo de proposta', 'Fluxo financiamento', 'Documentos para escritura']),
    vendaCampanhas: () => renderSimpleList('Campanhas de Venda', [
      ['Saia do Aluguel', 'Campanha para leads de primeiro imóvel.'],
      ['Semana do Financiamento', 'Condições e argumentos para financiamento.'],
      ['Últimas Unidades', 'Ação de urgência para fechamento.']
    ]),
    vendaRanking: () => renderRanking('Venda'),
    locacao: renderLocacao,
    locacaoMateriais: () => renderMaterials('Locação', ['Folder para locador', 'Mensagem para interessado', 'Guia de garantia locatícia', 'Modelo de captação']),
    locacaoDocumentos: () => renderMaterials('Documentos de Locação', ['Ficha cadastral', 'Checklist locatário', 'Checklist fiador', 'Termo de entrega de chaves']),
    locacaoVistorias: () => renderSimpleList('Vistorias', [
      ['Entrada - Ap. 42', 'Pendente de fotos e assinatura.'],
      ['Saída - Casa 18', 'Aguardando conferência final.'],
      ['Manutenção preventiva', 'Revisão hidráulica solicitada.']
    ]),
    locacaoOcorrencias: () => renderSimpleList('Ocorrências', [
      ['Vazamento', 'Chamado aberto com prioridade alta.'],
      ['Troca de fechadura', 'Aguardando orçamento.'],
      ['Pintura', 'Solicitação em análise.']
    ]),
    treinamentos: () => renderSimpleList('Treinamentos', [
      ['Integração', 'Primeiros passos na imobiliária.'],
      ['Objeções comerciais', 'Como responder sem perder o cliente.'],
      ['Documentação', 'Checklist antes da proposta.']
    ]),
    procedimentos: () => renderSimpleList('Procedimentos', [
      ['Cadastrar atendimento', 'Passo a passo para registrar lead.'],
      ['Agendar visita', 'Fluxo mínimo para evitar desencontro.'],
      ['Pós-visita', 'Roteiro de follow-up obrigatório.']
    ]),
    scripts: renderScripts,
    links: () => renderSimpleList('Links úteis', [
      ['CRM', 'Acesso ao sistema comercial.'],
      ['WhatsApp Web', 'Atendimento rápido.'],
      ['Simulador Caixa', 'Simulação de financiamento.'],
      ['Drive interno', 'Arquivos compartilhados.']
    ]),
    suporte: renderSupport,
    usuarios: renderUsers,
    configuracoes: renderSettings
  };
  content.innerHTML = renderers[currentPage]();
}

function renderDashboard() {
  return `
    <div class="notice"><strong>Versão de teste:</strong> login, permissões e dados estão salvos apenas neste navegador. Para produção, use Firebase Authentication + Firestore Rules.</div>
    <div class="grid cols-3">
      ${kpi('Avisos novos', '3', 'Ciência pendente')}
      ${kpi('Materiais', has('venda') && has('locacao') ? '24' : '12', 'Disponíveis')}
      ${kpi('Treinamentos', '2', 'Pendentes')}
    </div>
    <div class="grid cols-2" style="margin-top:18px">
      <div class="card featured">
        <span class="badge">Central da equipe</span>
        <h3>Menu personalizado por permissão</h3>
        <p>Cada usuário enxerga apenas as páginas que o administrador liberar na área de Usuários.</p>
      </div>
      <div class="card">
        <h3>Acessos deste usuário</h3>
        <p>${Object.entries(currentUser.permissions).filter(([_, v]) => v).map(([k]) => permissionLabels[k]).slice(0, 8).join(' • ')}</p>
      </div>
    </div>
  `;
}

function kpi(title, value, text) {
  return `<div class="card kpi"><div><p>${title}</p><strong>${value}</strong></div><span class="badge">${text}</span></div>`;
}

function renderVenda() {
  return `
    <div class="grid cols-3">
      ${kpi('Leads de venda', '38', 'Mês')}
      ${kpi('Visitas', '14', 'Agendadas')}
      ${kpi('Propostas', '6', 'Em análise')}
    </div>
    <div class="grid cols-2" style="margin-top:18px">
      <div class="card"><h3>Empreendimento destaque</h3><p>Residencial em campanha com materiais, argumentos, tabela e mensagens prontas.</p></div>
      <div class="card"><h3>Objeção da semana</h3><p>“Achei caro” — comparar valor percebido, financiamento, custo de oportunidade e urgência.</p></div>
    </div>
  `;
}

function renderLocacao() {
  return `
    <div class="grid cols-3">
      ${kpi('Imóveis disponíveis', '21', 'Locação')}
      ${kpi('Vistorias', '5', 'Pendentes')}
      ${kpi('Ocorrências', '4', 'Abertas')}
    </div>
    <div class="grid cols-2" style="margin-top:18px">
      <div class="card"><h3>Fluxo de locação</h3><p>Interessado → visita → ficha cadastral → análise → contrato → vistoria → entrega das chaves.</p></div>
      <div class="card"><h3>Atenção</h3><p>Organize documentos, garantias e vistorias para reduzir retrabalho e conflito com locatários.</p></div>
    </div>
  `;
}

function renderMaterials(title, items) {
  return `
    <div class="card">
      <h3>${title}</h3>
      <p>Área simulada para arquivos, mensagens e documentos. Na versão Firebase, os arquivos ficam no Storage.</p>
      <div class="list">
        ${items.map(item => `<div class="list-item"><div><strong>${item}</strong><span>Atualizado recentemente</span></div><button>Baixar</button></div>`).join('')}
      </div>
    </div>
  `;
}

function renderSimpleList(title, items) {
  return `
    <div class="card">
      <h3>${title}</h3>
      <div class="list">
        ${items.map(([a,b]) => `<div class="list-item"><div><strong>${a}</strong><span>${b}</span></div><span class="badge">Ativo</span></div>`).join('')}
      </div>
    </div>
  `;
}

function renderRanking(type) {
  return `
    <div class="card">
      <h3>Ranking de ${type}</h3>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Posição</th><th>Nome</th><th>Indicador</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>1º</td><td>Ana</td><td>12 visitas</td><td><span class="badge">Destaque</span></td></tr>
            <tr><td>2º</td><td>João</td><td>9 visitas</td><td>Em evolução</td></tr>
            <tr><td>3º</td><td>Carlos</td><td>7 visitas</td><td>Regular</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderScripts() {
  return `
    <div class="grid cols-2">
      <div class="card"><h3>Lead frio</h3><p>“Oi, tudo bem? Vi seu interesse e posso te ajudar a encontrar uma opção dentro do que você procura.”</p><div class="actions"><button onclick="copyText('Oi, tudo bem? Vi seu interesse e posso te ajudar a encontrar uma opção dentro do que você procura.')">Copiar</button></div></div>
      <div class="card"><h3>Cliente sumiu</h3><p>“Passando para saber se ainda faz sentido seguirmos com as opções que separei para você.”</p><div class="actions"><button onclick="copyText('Passando para saber se ainda faz sentido seguirmos com as opções que separei para você.')">Copiar</button></div></div>
    </div>
  `;
}

function renderSupport() {
  return `
    <div class="card">
      <h3>Abrir solicitação</h3>
      <p>Simulação de formulário interno.</p>
      <div class="grid cols-2" style="margin-top:16px">
        <div><label>Tipo</label><select><option>Problema com sistema</option><option>Documento desatualizado</option><option>Dúvida comercial</option></select></div>
        <div><label>Prioridade</label><select><option>Normal</option><option>Alta</option><option>Urgente</option></select></div>
      </div>
      <label style="display:block;margin-top:14px">Descrição</label>
      <textarea rows="5" placeholder="Descreva a solicitação..."></textarea>
      <div class="actions"><button>Enviar solicitação</button></div>
    </div>
  `;
}

function renderUsers() {
  return `
    <div class="card">
      <h3>Usuários cadastrados</h3>
      <p>Edite permissões por checkbox. O menu muda conforme o acesso liberado.</p>
      <div class="table-wrap" style="margin-top:18px">
        <table>
          <thead><tr><th>Nome</th><th>Usuário</th><th>Cargo</th><th>Departamento</th><th>Ação</th></tr></thead>
          <tbody>
            ${state.users.map(user => `<tr><td>${user.name}</td><td>${user.username}</td><td>${user.role}</td><td>${user.department}</td><td><button onclick="editUser('${user.id}')">Editar permissões</button></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div id="userEditor"></div>
    </div>
  `;
}

function editUser(userId) {
  const user = state.users.find(u => u.id === userId);
  const editor = document.getElementById('userEditor');
  editor.innerHTML = `
    <div class="permission-box">
      <h3>Editando: ${user.name}</h3>
      <div class="grid cols-3">
        <div><label>Nome</label><input id="editName" value="${user.name}"></div>
        <div><label>Cargo</label><input id="editRole" value="${user.role}"></div>
        <div><label>Departamento</label><input id="editDepartment" value="${user.department}"></div>
      </div>
      <h3 style="margin-top:20px">Permissões</h3>
      <div class="permission-grid">
        ${Object.entries(permissionLabels).map(([key, label]) => `
          <label class="check"><input type="checkbox" data-perm="${key}" ${user.permissions[key] ? 'checked' : ''}> ${label}</label>
        `).join('')}
      </div>
      <div class="actions">
        <button onclick="saveUserPermissions('${user.id}')">Salvar permissões</button>
        <button class="outline" onclick="applyPreset('${user.id}', 'venda')">Modelo Venda</button>
        <button class="outline" onclick="applyPreset('${user.id}', 'locacao')">Modelo Locação</button>
        <button class="secondary" onclick="applyPreset('${user.id}', 'admin')">Modelo Admin</button>
      </div>
    </div>
  `;
  editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveUserPermissions(userId) {
  const user = state.users.find(u => u.id === userId);
  user.name = document.getElementById('editName').value.trim() || user.name;
  user.role = document.getElementById('editRole').value.trim() || user.role;
  user.department = document.getElementById('editDepartment').value.trim() || user.department;
  document.querySelectorAll('[data-perm]').forEach(input => {
    user.permissions[input.dataset.perm] = input.checked;
  });
  saveState();
  if (currentUser.id === user.id) currentUser = JSON.parse(JSON.stringify(user));
  alert('Permissões salvas! Faça login com o usuário editado para testar o menu.');
  renderPage('usuarios');
}

function applyPreset(userId, preset) {
  const user = state.users.find(u => u.id === userId);
  const allFalse = Object.fromEntries(Object.keys(permissionLabels).map(key => [key, false]));
  if (preset === 'admin') user.permissions = Object.fromEntries(Object.keys(permissionLabels).map(key => [key, true]));
  if (preset === 'venda') user.permissions = { ...allFalse, dashboard: true, avisos: true, agenda: true, venda: true, vendaMateriais: true, vendaDocumentos: true, vendaCampanhas: true, treinamentos: true, procedimentos: true, scripts: true, links: true, suporte: true };
  if (preset === 'locacao') user.permissions = { ...allFalse, dashboard: true, avisos: true, agenda: true, locacao: true, locacaoMateriais: true, locacaoDocumentos: true, locacaoVistorias: true, locacaoOcorrencias: true, treinamentos: true, procedimentos: true, scripts: true, links: true, suporte: true };
  saveState();
  editUser(userId);
}

function renderSettings() {
  return `
    <div class="grid cols-2">
      <div class="card featured"><span class="badge">Identidade visual</span><h3>Amarelo, preto e branco</h3><p>Paleta aplicada: amarelo #ffc71b, preto e branco. Visual limpo, forte e comercial.</p></div>
      <div class="card"><h3>Próximo passo técnico</h3><p>Trocar login local por Firebase Authentication, salvar permissões no Firestore e proteger dados com regras de segurança.</p></div>
    </div>
    <div class="card" style="margin-top:18px"><h3>Resetar dados de teste</h3><p>Use caso queira voltar aos usuários e permissões iniciais.</p><div class="actions"><button onclick="resetData()">Resetar intranet</button></div></div>
  `;
}

function resetData() {
  if (!confirm('Resetar todos os dados locais?')) return;
  state = { users: defaultUsers };
  saveState();
  alert('Dados resetados. Faça login novamente.');
  logout();
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
  alert('Texto copiado!');
}

document.getElementById('loginForm').addEventListener('submit', event => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const ok = login(username, password);
  document.getElementById('loginError').textContent = ok ? '' : 'Usuário ou senha inválidos.';
});

document.getElementById('logoutBtn').addEventListener('click', logout);
