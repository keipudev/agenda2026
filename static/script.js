// Estado da aplicação
let estadoApp = {
    mesAtual: 0,
    dataSelecionada: '',
    eventos: {},
    meses: [],
    eventoEmEdicao: null
};

// Meses e dias para renderização do calendário
const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Ordem correta: Domingo primeiro (para casar com weekday() do Python, onde 6=Domingo)
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const nomesDiasCompletos = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacao();
});

async function inicializarAplicacao() {
    console.log('inicializarAplicacao() executando...');
    await carregarMeses();
    irParaHoje();
    
    // Definir data de hoje como padrão
    document.getElementById('data-selecionada').valueAsDate = new Date();
    document.getElementById('evento-data').valueAsDate = new Date();
    
    // Renderizar calendário inicial
    renderizarCalendario();
    
    // Renderizar grade de horas do dia
    renderizarGradeHoras();
    
    // Renderizar lista de eventos
    await carregarEventosDia();
    
    // Preencher seletor de horas
    preencherSeletorHoras();
    
    // Atualizar título do dia
    atualizarTituloDia();
    
    // Configurar todos os eventos
    configurarEventos();
}

function configurarEventos() {
    console.log('configurarEventos() executando...');
    
    // Navegação de abas
    document.querySelectorAll('.tab-btn, .nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn, .nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const tabId = e.target.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Botões de navegação do calendário
    document.getElementById('mes-anterior').addEventListener('click', () => {
        estadoApp.mesAtual = Math.max(0, estadoApp.mesAtual - 1);
        renderizarCalendario();
    });

    document.getElementById('mes-proximo').addEventListener('click', () => {
        estadoApp.mesAtual = Math.min(estadoApp.meses.length - 1, estadoApp.mesAtual + 1);
        renderizarCalendario();
    });

    // Botão Hoje
    document.getElementById('btn-hoje').addEventListener('click', irParaHoje);

    // Mudança de data no seletor de data
    document.getElementById('data-selecionada').addEventListener('change', (e) => {
        estadoApp.dataSelecionada = e.target.value;
        document.getElementById('evento-data').value = e.target.value;
        atualizarTituloDia();
        carregarEventosDia();
        renderizarGradeHoras();
    });

    // Botão novo evento
    document.getElementById('btn-novo-evento').addEventListener('click', () => {
        // Ativa aba de anotações
        document.querySelectorAll('.tab-btn, .nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-tab="anotacoes"]').classList.add('active');
        document.getElementById('anotacoes').classList.add('active');
        
        limparFormulario();
    });

    // Formulário de evento
    document.getElementById('btn-salvar-evento').addEventListener('click', salvarEvento);
    document.getElementById('btn-cancelar-evento').addEventListener('click', limparFormulario);

    // Modal
    document.querySelector('.close').addEventListener('click', fecharModal);
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modal-evento');
        if (e.target === modal) {
            fecharModal();
        }
    });
}

async function carregarMeses() {
    try {
        const response = await fetch('/api/meses');
        const dados = await response.json();
        estadoApp.meses = dados;
    } catch (erro) {
        console.error('Erro ao carregar meses:', erro);
    }
}

function irParaHoje() {
    console.log('irParaHoje() executando...');
    const hoje = new Date();
    const dataHojeStr = hoje.toISOString().split('T')[0];
    
    estadoApp.dataSelecionada = dataHojeStr;
    
    // Encontrar o índice do mês atual
    const mesAtualIdx = estadoApp.meses.findIndex(m => {
        const [ano, mes] = m.mes.split('-').map(Number);
        return ano === hoje.getFullYear() && mes === (hoje.getMonth() + 1);
    });
    
    if (mesAtualIdx >= 0) {
        estadoApp.mesAtual = mesAtualIdx;
    }
    
    // Atualizar campos de data
    document.getElementById('data-selecionada').value = dataHojeStr;
    document.getElementById('evento-data').value = dataHojeStr;
    document.getElementById('evento-data').valueAsDate = new Date();
    
    // Atualizar interface
    atualizarTituloDia();
    carregarEventosDia();
    renderizarGradeHoras();
    renderizarCalendario();
}

function atualizarTituloDia() {
    const dataStr = estadoApp.dataSelecionada || document.getElementById('data-selecionada').value;
    if (!dataStr) return;
    
    const data = new Date(dataStr + 'T00:00:00');
    const diaSemana = nomesDiasCompletos[data.getDay()];
    const dia = data.getDate();
    const mes = nomesMeses[data.getMonth()];
    const ano = data.getFullYear();
    
    document.getElementById('titulo-dia').textContent = `${diaSemana}, ${dia} de ${mes}`;
}

function renderizarCalendario() {
    const mes = estadoApp.meses[estadoApp.mesAtual];
    if (!mes) return;

    // Atualizar título do mês
    document.getElementById('titulo-mes').textContent = 
        `${mes.nome_mes} ${mes.ano}`;

    // Montar grid
    const container = document.getElementById('calendario-mes');
    container.innerHTML = '';

    // Adicionar cabeçalho com dias da semana (Dom a Sab)
    diasSemana.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'dia-semana';
        div.textContent = dia;
        container.appendChild(div);
    });

    // Adicionar dias do mês
    mes.dias.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'dia';

        if (!dia) {
            div.classList.add('outro-mes');
        } else {
            div.textContent = dia.dia;
            
            if (dia.tem_eventos) {
                div.classList.add('com-eventos');
            }

            if (dia.data === estadoApp.dataSelecionada) {
                div.classList.add('selecionado');
            }

            // Clique no dia do calendário
            div.addEventListener('click', () => {
                estadoApp.dataSelecionada = dia.data;
                document.getElementById('data-selecionada').value = dia.data;
                document.getElementById('evento-data').value = dia.data;
                atualizarTituloDia();
                carregarEventosDia();
                renderizarGradeHoras();
                renderizarCalendario();
            });
        }

        container.appendChild(div);
    });
}

function renderizarGradeHoras() {
    const container = document.getElementById('hours-grid');
    container.innerHTML = '';

    // Horas de 00:00 às 23:00
    for (let h = 0; h <= 23; h++) {
        const bloco = document.createElement('div');
        bloco.className = 'bloco-hora';

        const horaLabel = document.createElement('div');
        horaLabel.className = 'hora-label';
        horaLabel.textContent = String(h).padStart(2, '0') + ':00';

        const horaEventos = document.createElement('div');
        horaEventos.className = 'hora-eventos';
        horaEventos.id = `hora-${h}`;

        bloco.appendChild(horaLabel);
        bloco.appendChild(horaEventos);
        container.appendChild(bloco);
    }

    // Carregar eventos do dia
    carregarEventosDia();
}

async function carregarEventosDia() {
    try {
        const response = await fetch(`/api/eventos/${estadoApp.dataSelecionada}`);
        const eventos = await response.json();

        // Limpar grade anterior
        for (let h = 0; h <= 23; h++) {
            document.getElementById(`hora-${h}`).innerHTML = '';
        }

        // Adicionar eventos às horas correspondentes
        eventos.forEach(evento => {
            const hora = parseInt(evento.hora.split(':')[0]);
            const container = document.getElementById(`hora-${hora}`);

            if (container) {
                const card = document.createElement('div');
                card.className = 'evento-card';
                card.style.borderLeftColor = evento.cor;

                card.innerHTML = `
                    <div class="evento-titulo">${evento.titulo}</div>
                    ${evento.descricao ? `<div class="evento-desc">${evento.descricao.substring(0, 30)}...</div>` : ''}
                `;

                card.addEventListener('click', () => abrirDetalhesEvento(evento));
                container.appendChild(card);
            }
        });

        // Atualizar lista de eventos
        renderizarListaEventos(eventos);

    } catch (erro) {
        console.error('Erro ao carregar eventos:', erro);
    }
}

function renderizarListaEventos(eventos) {
    const container = document.getElementById('lista-eventos');
    container.innerHTML = '';

    if (eventos.length === 0) {
        container.innerHTML = '<p class="no-events">Nenhum evento neste dia</p>';
        return;
    }

    eventos.forEach(evento => {
        const item = document.createElement('div');
        item.className = 'evento-item';
        item.style.borderLeft = `4px solid ${evento.cor}`;

        item.innerHTML = `
            <div class="evento-item-titulo">${evento.titulo}</div>
            <div class="evento-item-info">${evento.hora} - ${evento.duracao}h</div>
            ${evento.descricao ? `<div class="evento-item-info">${evento.descricao}</div>` : ''}
        `;

        item.addEventListener('click', () => abrirDetalhesEvento(evento));
        container.appendChild(item);
    });
}

function preencherSeletorHoras() {
    const select = document.getElementById('evento-hora');
    select.innerHTML = '<option value="">Selecione hora</option>';
    
    // Horas de 00:00 até 23:00
    for (let h = 0; h <= 23; h++) {
        const option = document.createElement('option');
        option.value = String(h).padStart(2, '0') + ':00';
        option.textContent = String(h).padStart(2, '0') + ':00';
        select.appendChild(option);
    }
}

async function salvarEvento() {
    const data = document.getElementById('evento-data').value;
    const hora = document.getElementById('evento-hora').value;
    const titulo = document.getElementById('evento-titulo').value;
    const descricao = document.getElementById('evento-descricao').value;
    const duracao = document.getElementById('evento-duracao').value;
    const cor = document.getElementById('evento-cor').value;

    if (!data || !hora || !titulo) {
        alert('Preenchimento obrigatório: Data, Hora e Título');
        return;
    }

    try {
        if (estadoApp.eventoEmEdicao) {
            // Atualizar evento
            await fetch(`/api/evento/${estadoApp.eventoEmEdicao}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, descricao, duracao, cor })
            });
        } else {
            // Criar novo evento
            await fetch('/api/evento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, hora, titulo, descricao, duracao, cor })
            });
        }

        // Recarregar dados
        await carregarMeses();
        await carregarEventosDia();
        renderizarCalendario();
        limparFormulario();

    } catch (erro) {
        console.error('Erro ao salvar evento:', erro);
        alert('Erro ao salvar evento');
    }
}

function limparFormulario() {
    document.getElementById('evento-titulo').value = '';
    document.getElementById('evento-descricao').value = '';
    document.getElementById('evento-duracao').value = '1';
    document.getElementById('evento-cor').value = '#3498db';
    estadoApp.eventoEmEdicao = null;
}

async function abrirDetalhesEvento(evento) {
    estadoApp.eventoEmEdicao = evento.id;

    const modal = document.getElementById('modal-evento');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div style="margin-bottom: 15px;">
            <label>Data</label>
            <input type="date" id="modal-data" value="${evento.data}" disabled style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label>Hora</label>
            <input type="text" id="modal-hora" value="${evento.hora}" disabled style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label>Título</label>
            <input type="text" id="modal-titulo" value="${evento.titulo}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div style="margin-bottom: 15px;">
            <label>Descrição</label>
            <textarea id="modal-descricao" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px;">${evento.descricao || ''}</textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div>
                <label>Duração</label>
                <select id="modal-duracao" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="1" ${evento.duracao == 1 ? 'selected' : ''}>1 hora</option>
                    <option value="2" ${evento.duracao == 2 ? 'selected' : ''}>2 horas</option>
                    <option value="4" ${evento.duracao == 4 ? 'selected' : ''}>4 horas</option>
                    <option value="8" ${evento.duracao == 8 ? 'selected' : ''}>8 horas</option>
                </select>
            </div>
            <div>
                <label>Cor</label>
                <input type="color" id="modal-cor" value="${evento.cor}" style="width: 100%; height: 40px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
            </div>
        </div>
        <div style="display: flex; gap: 10px;">
            <button onclick="atualizarEventoModal()" style="flex: 1; padding: 10px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Atualizar</button>
            <button onclick="deletarEventoModal(${evento.id})" style="flex: 1; padding: 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Deletar</button>
            <button onclick="fecharModal()" style="flex: 1; padding: 10px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Fechar</button>
        </div>
    `;

    modal.classList.add('active');
}

async function atualizarEventoModal() {
    const titulo = document.getElementById('modal-titulo').value;
    const descricao = document.getElementById('modal-descricao').value;
    const duracao = document.getElementById('modal-duracao').value;
    const cor = document.getElementById('modal-cor').value;

    try {
        await fetch(`/api/evento/${estadoApp.eventoEmEdicao}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, descricao, duracao, cor })
        });

        await carregarMeses();
        await carregarEventosDia();
        renderizarCalendario();
        renderizarGradeHoras();
        fecharModal();

    } catch (erro) {
        console.error('Erro ao atualizar evento:', erro);
        alert('Erro ao atualizar evento');
    }
}

async function deletarEventoModal(id) {
    if (confirm('Tem certeza que deseja deletar este evento?')) {
        try {
            await fetch(`/api/evento/${id}`, { method: 'DELETE' });

            await carregarMeses();
            await carregarEventosDia();
            renderizarCalendario();
            renderizarGradeHoras();
            fecharModal();

        } catch (erro) {
            console.error('Erro ao deletar evento:', erro);
            alert('Erro ao deletar evento');
        }
    }
}

function fecharModal() {
    document.getElementById('modal-evento').classList.remove('active');
    estadoApp.eventoEmEdicao = null;
}