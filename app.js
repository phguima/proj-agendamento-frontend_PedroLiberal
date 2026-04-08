// Elementos da UI
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const proximasSection = document.getElementById('proximas-section');
const realizadasSection = document.getElementById('realizadas-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const agendamentosList = document.getElementById('agendamentos-list');
const proximasList = document.getElementById('proximas-list');
const realizadasList = document.getElementById('realizadas-list');
const modal = document.getElementById('agend-modal');
const newAgendBtn = document.getElementById('new-agend-btn');
const closeModal = document.querySelector('.close');
const agendForm = document.getElementById('agend-form');
const profSelect = document.getElementById('prof-select');

// Navegação
const navDashBtn = document.getElementById('nav-dash-btn');
const navProximasBtn = document.getElementById('nav-proximas-btn');
const navRealizadasBtn = document.getElementById('nav-realizadas-btn');

// Elementos para Edição
const modalTitle = document.getElementById('modal-title');
const editIdInput = document.getElementById('edit-id');
const agendDateInput = document.getElementById('agend-date');
const agendObsInput = document.getElementById('agend-obs');

// Cadastro
const profExtraFields = document.getElementById('prof-extra-fields');
const clientExtraFields = document.getElementById('client-extra-fields');
const signupIsProf = document.getElementById('signup-is-prof');
const signupEspSelect = document.getElementById('signup-esp');

signupIsProf.addEventListener('change', async () => {
    if (signupIsProf.checked) {
        profExtraFields.classList.remove('hidden');
        clientExtraFields.classList.add('hidden');
        const esps = await api.getEspecialidades();
        signupEspSelect.innerHTML = esps.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
    } else {
        profExtraFields.classList.add('hidden');
        clientExtraFields.classList.remove('hidden');
    }
});

tabLogin.addEventListener('click', () => {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
});

tabSignup.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
});

// Lógica de Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    try {
        const data = await api.login(email, pass);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user_email', email);
        initDashboard();
    } catch (err) { alert(err.message); }
});

// Lógica de Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const isProf = signupIsProf.checked;
    const userData = {
        nome: document.getElementById('signup-name').value,
        email: document.getElementById('signup-email').value,
        senha: document.getElementById('signup-password').value,
        eh_profissional: isProf
    };
    try {
        const user = await api.signup(userData);
        if (isProf) {
            const profData = {
                crm_ou_registro: document.getElementById('signup-crm').value,
                especialidades_ids: [parseInt(signupEspSelect.value)]
            };
            await api.completeProfProfile(user.id, profData);
        } else {
            const clientData = {
                cpf: document.getElementById('signup-cpf').value,
                telefone: document.getElementById('signup-phone').value
            };
            await api.completeClientProfile(user.id, clientData);
        }
        alert("Conta criada com sucesso! Agora faça o login.");
        tabLogin.click();
    } catch (err) { alert("Erro no cadastro: " + err.message); }
});

async function initDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    document.getElementById('nav-user').classList.remove('hidden');
    document.getElementById('user-display').innerText = localStorage.getItem('user_email');
    loadAgendamentos();
    loadProfissionais();
}

// Navegação
function showSection(section) {
    [dashboardSection, proximasSection, realizadasSection].forEach(s => s.classList.add('hidden'));
    section.classList.remove('hidden');
}

navDashBtn.onclick = () => { showSection(dashboardSection); loadAgendamentos(); };
navProximasBtn.onclick = () => { showSection(proximasSection); loadProximasConsultas(); };
navRealizadasBtn.onclick = () => { showSection(realizadasSection); loadConsultasRealizadas(); };

async function loadAgendamentos() {
    agendamentosList.innerHTML = '<p>Carregando...</p>';
    try {
        const list = await api.getAgendamentos();
        renderList(list, agendamentosList);
    } catch (err) { agendamentosList.innerHTML = '<p>Erro ao carregar dados.</p>'; }
}

async function loadProximasConsultas() {
    proximasList.innerHTML = '<p>Carregando...</p>';
    try {
        const now = new Date();
        const list = await api.getAgendamentos();
        const filtrados = list.filter(item => item.status === 'Agendado' && new Date(item.data_hora) > now);
        renderList(filtrados, proximasList);
    } catch (err) { proximasList.innerHTML = '<p>Erro ao filtrar dados.</p>'; }
}

async function loadConsultasRealizadas() {
    realizadasList.innerHTML = '<p>Carregando...</p>';
    try {
        const now = new Date();
        const list = await api.getAgendamentos();
        // Filtrar 'Concluído' ou 'Agendado' mas com data passada
        const filtrados = list.filter(item => 
            item.status === 'Concluído' || (item.status === 'Agendado' && new Date(item.data_hora) <= now)
        );
        renderList(filtrados, realizadasList, false); // false para ocultar botões de ação
    } catch (err) { realizadasList.innerHTML = '<p>Erro ao carregar histórico.</p>'; }
}

function renderList(list, container, showActions = true) {
    container.innerHTML = '';
    if (list.length === 0) { container.innerHTML = '<p>Nenhum registro encontrado.</p>'; return; }
    list.forEach(item => {
        const card = document.createElement('div');
        card.className = `agend-card ${item.status.toLowerCase()}`;
        const itemData = encodeURIComponent(JSON.stringify(item));
        card.innerHTML = `
            <span class="status-badge">${item.status}</span>
            <h3>Consulta Médica</h3>
            <p><strong>📅 Data:</strong> ${new Date(item.data_hora).toLocaleString()}</p>
            <p><strong>📝 Obs:</strong> ${item.observacoes || 'Sem observações'}</p>
            ${showActions && item.status === 'Agendado' ? `
                <div class="card-actions">
                    <button class="btn-edit" onclick="handleEditar('${itemData}')">Alterar</button>
                    <button class="btn-cancel" onclick="handleCancelar(${item.id})">Cancelar</button>
                </div>
            ` : ''}
        `;
        container.appendChild(card);
    });
}

window.handleEditar = (encodedData) => {
    const item = JSON.parse(decodeURIComponent(encodedData));
    modalTitle.innerText = "Alterar Agendamento";
    editIdInput.value = item.id;
    profSelect.value = item.id_profissional;
    const date = new Date(item.data_hora);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISODate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    agendDateInput.value = localISODate;
    agendObsInput.value = item.observacoes || '';
    modal.classList.remove('hidden');
};

async function handleCancelar(id) {
    if (confirm("Tem certeza que deseja cancelar esta consulta?")) {
        try {
            await api.cancelarAgendamento(id);
            alert("Consulta cancelada!");
            loadAgendamentos();
            if (!proximasSection.classList.contains('hidden')) loadProximasConsultas();
        } catch (err) { alert(err.message); }
    }
}
window.handleCancelar = handleCancelar;

async function loadProfissionais() {
    try {
        const profs = await api.getProfissionais();
        profSelect.innerHTML = profs.map(p => `<option value="${p.id}">${p.crm_ou_registro} (ID: ${p.id})</option>`).join('');
    } catch (err) { console.error("Erro ao carregar profissionais"); }
}

newAgendBtn.onclick = () => {
    modalTitle.innerText = "Novo Agendamento";
    editIdInput.value = "";
    agendForm.reset();
    modal.classList.remove('hidden');
};
closeModal.onclick = () => modal.classList.add('hidden');

agendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const agendId = editIdInput.value;
    let clienteId = localStorage.getItem('user_client_id');
    if (!clienteId) {
        try {
            const clientes = await fetch(`${BASE_URL}/clientes/`).then(r => r.json());
            clienteId = clientes.length > 0 ? clientes[clientes.length - 1].id : 1;
            localStorage.setItem('user_client_id', clienteId);
        } catch (err) { clienteId = 1; }
    }
    const data = {
        id_profissional: parseInt(profSelect.value),
        id_cliente: parseInt(clienteId), 
        data_hora: agendDateInput.value,
        observacoes: agendObsInput.value
    };
    try {
        if (agendId) { await api.atualizarAgendamento(agendId, data); alert("Agendamento alterado!"); }
        else { await api.criarAgendamento(data); alert("Agendamento realizado!"); }
        modal.classList.add('hidden');
        loadAgendamentos();
        if (!proximasSection.classList.contains('hidden')) loadProximasConsultas();
    } catch (err) { alert(err.message); }
});

document.getElementById('logout-btn').onclick = () => { localStorage.clear(); location.reload(); };
if (localStorage.getItem('token')) initDashboard();
