// ── MODO ESCURO ───────────────────────────────

function aplicarTema() {
    const tema = localStorage.getItem('tema') || 'light';
    document.documentElement.setAttribute('data-theme', tema);
    const btns = document.querySelectorAll('.theme-toggle, .theme-toggle-auth');
    btns.forEach(btn => {
        btn.textContent = tema === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    });
}

function alternarTema() {
    const atual = localStorage.getItem('tema') || 'light';
    const novo = atual === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tema', novo);
    aplicarTema();
}

// ── AUTENTICAÇÃO ─────────────────────────────

function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('erro').textContent = data.mensagem;
        }
    })
    .catch(() => {
        document.getElementById('erro').textContent = 'Erro ao conectar com o servidor.';
    });
}

function cadastrar() {
    const dados = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        senha: document.getElementById('senha').value,
        cpf: document.getElementById('cpf').value,
        telefone: document.getElementById('telefone').value,
        data_nascimento: document.getElementById('data_nascimento').value
    };

    fetch('http://127.0.0.1:5000/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = 'index.html';
        } else {
            document.getElementById('erro').textContent = data.mensagem;
        }
    })
    .catch(() => {
        document.getElementById('erro').textContent = 'Erro ao conectar com o servidor.';
    });
}

function sair() {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
}

// ── USUÁRIO LOGADO ────────────────────────────

function carregarUsuario() {
    const el = document.getElementById('usuario-nome');
    if (!el) return;
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        el.textContent = 'Olá, ' + usuario.nome;
    }
}

// ── DASHBOARD ─────────────────────────────────

function carregarDashboard() {
    fetch('http://127.0.0.1:5000/equipamentos')
    .then(res => res.json())
    .then(data => {
        const total = document.getElementById('total-itens');
        const manutencao = document.getElementById('em-manutencao');
        if (total) total.textContent = data.length;
        if (manutencao) {
            const emManutencao = data.filter(e => e.status && e.status.toLowerCase().includes('manutenção')).length;
            manutencao.textContent = emManutencao;
        }
    })
    .catch(() => {});
}

// ── EQUIPAMENTOS ──────────────────────────────

let todosEquipamentos = [];

function carregarEquipamentos() {
    fetch('http://127.0.0.1:5000/equipamentos')
    .then(res => res.json())
    .then(data => {
        todosEquipamentos = data;
        renderizarTabela(data);
    });
}

function renderizarTabela(lista) {
    const corpo = document.getElementById('corpo-tabela');
    if (!corpo) return;

    if (lista.length === 0) {
        corpo.innerHTML = '<tr class="empty-row"><td colspan="6">Nenhum bem encontrado.</td></tr>';
        return;
    }

    corpo.innerHTML = lista.map(eq => `
        <tr>
            <td>${eq.numero_patrimonio || '—'}</td>
            <td>${eq.nome}</td>
            <td>${eq.categoria || '—'}</td>
            <td>${eq.localizacao || '—'}</td>
            <td>${eq.estado_conservacao || '—'}</td>
            <td>
                <button class="btn-danger" onclick="deletarEquipamento(${eq.id_equipamento})">Remover</button>
            </td>
        </tr>
    `).join('');
}

function filtrarTabela() {
    const filtroPat = document.getElementById('filtro-patrimonio')?.value.toLowerCase() || '';
    const filtroNome = document.getElementById('filtro-nome')?.value.toLowerCase() || '';

    const filtrado = todosEquipamentos.filter(eq => {
        const pat = (eq.numero_patrimonio || '').toLowerCase();
        const nome = (eq.nome || '').toLowerCase();
        return pat.includes(filtroPat) && nome.includes(filtroNome);
    });

    renderizarTabela(filtrado);
}

function adicionarEquipamento() {
    const dados = {
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        estado_conservacao: document.getElementById('estado_conservacao').value,
        localizacao: document.getElementById('localizacao').value,
        numero_patrimonio: document.getElementById('numero_patrimonio').value,
        categoria: document.getElementById('categoria').value,
        status: document.getElementById('status').value,
        data_aquisicao: document.getElementById('data_aquisicao').value
    };

    fetch('http://127.0.0.1:5000/equipamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            alert('Equipamento adicionado!');
            carregarEquipamentos();
        }
    });
}

function deletarEquipamento(id) {
    if (!confirm('Tem certeza que deseja remover este equipamento?')) return;

    fetch(`http://127.0.0.1:5000/equipamentos/${id}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.sucesso) {
            carregarEquipamentos();
        }
    });
}

// ── INICIALIZAÇÃO ─────────────────────────────

window.onload = function () {
    aplicarTema();
    carregarUsuario();

    if (document.getElementById('corpo-tabela')) {
        carregarEquipamentos();
    }

    if (document.getElementById('total-itens')) {
        carregarDashboard();
    }
}
