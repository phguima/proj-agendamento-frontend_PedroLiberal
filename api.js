const BASE_URL = 'http://127.0.0.1:8001/api/v1';

const api = {
    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        if (!response.ok) throw new Error("Credenciais inválidas");
        return response.json();
    },

    async signup(userData) {
        const response = await fetch(`${BASE_URL}/usuarios/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erro no cadastro");
        }
        return response.json();
    },

    async getAgendamentos() {
        const response = await fetch(`${BASE_URL}/agendamentos/`);
        return response.json();
    },

    async getProfissionais() {
        const response = await fetch(`${BASE_URL}/saude/profissionais`);
        return response.json();
    },

    async getEspecialidades() {
        const response = await fetch(`${BASE_URL}/saude/especialidades`);
        return response.json();
    },

    async completeProfProfile(userId, data) {
        const response = await fetch(`${BASE_URL}/saude/profissionais/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erro ao completar perfil profissional");
        }
        return response.json();
    },

    async completeClientProfile(userId, data) {
        const response = await fetch(`${BASE_URL}/clientes/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erro ao completar perfil de cliente");
        }
        return response.json();
    },

    async criarAgendamento(data) {
        const response = await fetch(`${BASE_URL}/agendamentos/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erro ao agendar");
        }
        return response.json();
    },

    async cancelarAgendamento(agendamentoId) {
        const response = await fetch(`${BASE_URL}/agendamentos/${agendamentoId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erro ao cancelar agendamento");
        }
        return true;
    },

    async atualizarAgendamento(agendamentoId, data) {
        const response = await fetch(`${BASE_URL}/agendamentos/${agendamentoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Erro ao atualizar agendamento");
        }
        return response.json();
    }
};
