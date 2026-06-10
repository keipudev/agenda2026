// Estado da aplicação
let estadoApp = {
    mesAtual: 0,
    dataSelecionada: '',
    eventos: {},
    meses: [],
    eventoEmEdicao: null,
    rotinasDoDia: []
};

// Meses e dias para renderização do calendário
const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// Ordem correta: Domingo primeiro (para casar com weekday() do Python, onde 6=Domingo)
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const nomesDiasCompletos = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const nomesDiasCompletosFormat = {
    0: 'Domingo', 1: 'Segunda-feira', 2: 'Terça-feira',
    3: 'Quarta-feira', 4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado'
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacao();
});

// Função principal de inicialização
async function inicializarAplicacao() {
    console.log('inicializarAplicacao() executando...');
    await carregarMeses();
    irParaHoje();
    preencherSeletorHoras();
    configurarEventos();
    configurarRotinas();
    configurarDarkMode();
}

// Configura todos os event listeners
function configurarEventos() {
    console.log('configurarEventos() executando...');
    
    // Navegação de abas
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const clickedBtn = e.currentTarget || btn;
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            clickedBtn.classList.add('active');
            const tabId = clickedBtn.dataset.tab;
            document.getElementById(tabId).classList.add('active');
            
            if (tabId === 'rotinas') {
                carregarRotinas();
            }
        });
    });

    document.getElementById('mes-anterior').addEventListener('click', () => {
        estadoApp.mesAtual = Math.max(0, estadoApp.mesAtual - 1);
        renderizarCalendario();
    });

    document.getElementById('mes-proximo').addEventListener('click', () => {
        estadoApp.mesAtual = Math.min(estadoApp.meses.length - 1, estadoApp.mesAtual + 1);
        renderizarCalendario();
    });

    document.getElementById('btn-hoje').addEventListener('click', irParaHoje);

    document.getElementById('data-selecionada').addEventListener('change', (e) => {
        estadoApp.dataSelecionada = e.target.value;
        document.getElementById('evento-data').value = e.target.value;
        atualizarTituloDia();
        renderizarGradeHoras();
        carregarEventosDia();
        carregarRotinaDia(estadoApp.dataSelecionada);
    });

    document.getElementById('btn-novo-evento').addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-tab="anotacoes"]').classList.add('active');
        document.getElementById('anotacoes').classList.add('active');
        limparFormulario();
    });

    document.getElementById('btn-salvar-evento').addEventListener('click', salvarEvento);
    document.getElementById('btn-cancelar-evento').addEventListener('click', limparFormulario);
    
    document.getElementById('form-evento').addEventListener('submit', (e) => e.preventDefault());

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

async function irParaHoje() {
    console.log('irParaHoje() executando...');
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataHojeStr = `${ano}-${mes}-${dia}`;
    
    estadoApp.dataSelecionada = dataHojeStr;
    
    const mesAtualIdx = estadoApp.meses.findIndex(m => {
        const [ano, mes] = m.mes.split('-').map(Number);
        return ano === hoje.getFullYear() && mes === (hoje.getMonth() + 1);
    });
    
    if (mesAtualIdx >= 0) {
        estadoApp.mesAtual = mesAtualIdx;
    }
    
    document.getElementById('data-selecionada').value = dataHojeStr;
    document.getElementById('evento-data').value = dataHojeStr;
    
    atualizarTituloDia();
    renderizarCalendario();
    renderizarGradeHoras();
    await carregarEventosDia();
    await carregarRotinaDia(dataHojeStr);
}

function atualizarTituloDia() {
    const dataStr = estadoApp.dataSelecionada || document.getElementById('data-selecionada').value;
    if (!dataStr) return;
    
    const data = new Date(dataStr + 'T00:00:00');
    const diaSemana = nomesDiasCompletos[data.getDay()];
    const dia = data.getDate();
    const mes = nomesMeses[data.getMonth()];
    
    document.getElementById('titulo-dia').textContent = `${diaSemana}, ${dia} de ${mes}`;
}

function renderizarCalendario() {
    const mes = estadoApp.meses[estadoApp.mesAtual];
    if (!mes) return;

    document.getElementById('titulo-mes').textContent = `${mes.nome_mes} ${mes.ano}`;
    
    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

    const container = document.getElementById('calendario-mes');
    container.innerHTML = '';

    diasSemana.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'dia-semana';
        div.textContent = dia;
        container.appendChild(div);
    });

    mes.dias.forEach(dia => {
        const div = document.createElement('div');
        div.className = 'dia';

        if (!dia) {
            div.classList.add('outro-mes');
        } else {
            div.textContent = dia.dia;
            
            if (dia.data === hojeStr) {
                div.classList.add('hoje');
            }
            
            if (dia.tem_eventos) {
                div.classList.add('com-eventos');
            }

            if (dia.tem_rotinas) {
                div.classList.add('tem-rotinas');
            }

            if (dia.data === estadoApp.dataSelecionada) {
                div.classList.add('selecionado');
            }

            div.addEventListener('click', () => {
                estadoApp.dataSelecionada = dia.data;
                document.getElementById('data-selecionada').value = dia.data;
                document.getElementById('evento-data').value = dia.data;
                atualizarTituloDia();
                renderizarGradeHoras();
                carregarEventosDia();
                carregarRotinaDia(dia.data);
                renderizarCalendario();
            });
        }

        container.appendChild(div);
    });
}

function renderizarGradeHoras() {
    const container = document.getElementById('hours-grid');
    container.innerHTML = '';

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
}

async function carregarEventosDia() {
    try {
        const response = await fetch(`/api/eventos/${estadoApp.dataSelecionada}`);
        const eventos = await response.json();

        for (let h = 0; h <= 23; h++) {
            const el = document.getElementById(`hora-${h}`);
            if (el) el.innerHTML = '';
        }

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

        renderizarListaEventos(eventos);

    } catch (erro) {
        console.error('Erro ao carregar eventos:', erro);
    }
}

async function carregarRotinaDia(data) {
    try {
        const response = await fetch(`/api/rotinas/${data}`);
        const rotinas = await response.json();
        estadoApp.rotinasDoDia = Array.isArray(rotinas) ? rotinas : [];
        renderizarRotinaDia(data);
    } catch (erro) {
        console.error('Erro ao carregar rotinas do dia:', erro);
    }
}

function renderizarRotinaDia(data) {
    const container = document.getElementById('rotina-dia-content');
    const dataLabel = document.getElementById('rotina-dia-data');
    
    if (!data || !container || !dataLabel) return;
    
    dataLabel.textContent = formatarData(data);
    
    if (!estadoApp.rotinasDoDia || estadoApp.rotinasDoDia.length === 0) {
        container.innerHTML = '<p class="no-events">Nenhuma rotina neste dia</p>';
        return;
    }
    
    container.innerHTML = '';
    estadoApp.rotinasDoDia.forEach(rotina => {
        const item = document.createElement('div');
        item.className = 'rotina-dia-item';
        item.style.borderLeftColor = rotina.cor;

        const diasNomes = [];
        JSON.parse(rotina.dias_semana).forEach(d => diasNomes.push(nomesDiasCompletos[d] || ''));

        item.innerHTML = `
            <div class="rotina-dia-item-titulo">${rotina.titulo}</div>
            ${rotina.descricao ? `<div class="rotina-dia-item-info">${rotina.descricao}</div>` : ''}
            <div class="rotina-dia-item-info">${diasNomes.join(', ')}</div>
            <div class="rotina-dia-item-horario">Das ${rotina.hora_inicio} - ${buscarFimHorario(rotina.hora_inicio, rotina.duracao)}</div>
        `;

        container.appendChild(item);
    });
}

function buscarFimHorario(inicio, duracao) {
    if (!inicio || !duracao) return '';
    const [hora, min] = inicio.split(':').map(Number);
    const totalMin = hora * 60 + min + (duracao * 60);
    const hFinal = Math.floor(totalMin / 60) % 24;
    const mFinal = totalMin % 60;
    return `${String(hFinal).padStart(2, '0')}:${String(mFinal).padStart(2, '0')}`;
}

function formatarData(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr + 'T00:00:00');
    return `${nomesDiasCompletosFormat[data.getDay()]}, ${data.getDate()} de ${nomesMeses[data.getMonth()]}`;
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
            await fetch(`/api/evento/${estadoApp.eventoEmEdicao}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titulo, descricao, duracao, cor })
            });
        } else {
            await fetch('/api/evento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data, hora, titulo, descricao, duracao, cor })
            });
        }

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

function configurarDarkMode() {
    const toggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    toggle.innerHTML = currentTheme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    
    toggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        toggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    });
}

// ========== ROTINAS ==========
function configurarRotinas() {
    preencherSeletorHorasRotina();
    
    document.getElementById('form-rotina').addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarRotina();
    });
}

function preencherSeletorHorasRotina() {
    const select = document.getElementById('rotina-hora');
    select.innerHTML = '<option value="">Selecione hora</option>';
    
    for (let h = 0; h <= 23; h++) {
        const option = document.createElement('option');
        option.value = String(h).padStart(2, '0') + ':00';
        option.textContent = String(h).padStart(2, '0') + ':00';
        select.appendChild(option);
    }
}

async function carregarRotinas() {
    try {
        const response = await fetch('/api/rotinas');
        const rotinas = await response.json();
        
        const container = document.getElementById('lista-rotinas');
        
        if (rotinas.length === 0) {
            container.innerHTML = '<p class="no-events">Nenhuma rotina cadastrada</p>';
            return;
        }
        
        container.innerHTML = '';
        
        rotinas.forEach(r => {
            const item = document.createElement('div');
            item.className = 'rotina-item';
            item.style.borderLeftColor = r.cor;
            
            const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
            const diasSelecionados = JSON.parse(r.dias_semana).map(d => diasNomes[d]).join(', ');
            
            item.innerHTML = `
                <div class="rotina-item-titulo">${r.titulo}</div>
                <div class="rotina-item-info">${r.descricao || ''}</div>
                <div class="rotina-item-info">${diasSelecionados} às ${r.hora_inicio}</div>
                <div class="rotina-actions">
                    <button class="btn-primary" onclick="gerarEventosRotina(${r.id})">Gerar Eventos</button>
                    <button class="btn-secondary" onclick="deletarRotina(${r.id})">Excluir</button>
                </div>
            `;
            
            container.appendChild(item);
        });
    } catch (erro) {
        console.error('Erro ao carregar rotinas:', erro);
    }
}

async function salvarRotina() {
    const titulo = document.getElementById('rotina-titulo').value;
    const descricao = document.getElementById('rotina-descricao').value;
    const cor = document.getElementById('rotina-cor').value;
    const hora_inicio = document.getElementById('rotina-hora').value;
    const duracao = document.getElementById('rotina-duracao').value;
    const data_inicio = document.getElementById('rotina-data-inicio').value;
    const data_fim = document.getElementById('rotina-data-fim').value;
    
    const diasSemana = [];
    document.querySelectorAll('.weekday-chk input[type="checkbox"]').forEach(cb => {
        if (cb.checked) {
            diasSemana.push(parseInt(cb.value));
        }
    });
    
    if (!titulo || diasSemana.length === 0 || !data_inicio) {
        alert('Preenchimento obrigatório: Título, dias da semana e data início');
        return;
    }
    
    try {
        const response = await fetch('/api/rotina', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo, descricao, cor, dias_semana: diasSemana,
                hora_inicio, duracao, data_inicio, data_fim: data_fim || null
            })
        });
        
        if (response.ok) {
            limparFormularioRotina();
            carregarRotinas();
        } else {
            const erro = await response.json();
            alert(erro.error || 'Erro ao criar rotina');
        }
    } catch (erro) {
        console.error('Erro ao salvar rotina:', erro);
        alert('Erro ao salvar rotina');
    }
}

async function gerarEventosRotina(id) {
    try {
        const response = await fetch(`/api/rotina/${id}/gerar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        const resultado = await response.json();
        alert(`Gerados ${resultado.eventos_criados} eventos`);
        await carregarMeses();
        await carregarEventosDia();
        renderizarCalendario();
    } catch (erro) {
        console.error('Erro ao gerar eventos:', erro);
        alert('Erro ao gerar eventos');
    }
}

async function deletarRotina(id) {
    if (confirm('Tem certeza que deseja deletar esta rotina?')) {
        try {
            await fetch(`/api/rotina/${id}`, { method: 'DELETE' });
            carregarRotinas();
        } catch (erro) {
            console.error('Erro ao deletar rotina:', erro);
            alert('Erro ao deletar rotina');
        }
    }
}

function limparFormularioRotina() {
    document.getElementById('rotina-titulo').value = '';
    document.getElementById('rotina-descricao').value = '';
    document.getElementById('rotina-cor').value = '#4285f4';
    document.getElementById('rotina-hora').value = '';
    document.getElementById('rotina-duracao').value = '2';
    document.getElementById('rotina-data-inicio').value = '';
    document.getElementById('rotina-data-fim').value = '';
    document.querySelectorAll('.weekday-chk input[type="checkbox"]').forEach(cb => cb.checked = false);
}
