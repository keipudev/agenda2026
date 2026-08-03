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

function criarTimePicker(container, valorInicial) {
    container.innerHTML = `
        <div class="spinner-group">
            <button class="spinner-btn up" type="button"></button>
            <input type="text" class="spinner-input" value="${String(valorInicial).padStart(2, '0')}" maxlength="2" inputmode="numeric">
            <button class="spinner-btn down" type="button"></button>
        </div>
        <span class="time-sep">:</span>
        <div class="spinner-group">
            <button class="spinner-btn up" type="button"></button>
            <input type="text" class="spinner-input" value="00" maxlength="2" inputmode="numeric">
            <button class="spinner-btn down" type="button"></button>
        </div>
    `;
    const hourInput = container.querySelector('.spinner-group:first-child .spinner-input');
    const hourUp = container.querySelector('.spinner-group:first-child .spinner-btn.up');
    const hourDown = container.querySelector('.spinner-group:first-child .spinner-btn.down');
    const minInput = container.querySelector('.spinner-group:last-child .spinner-input');
    const minUp = container.querySelector('.spinner-group:last-child .spinner-btn.up');
    const minDown = container.querySelector('.spinner-group:last-child .spinner-btn.down');
    let hora = valorInicial;
    let minuto = 0;

    function atualizar() {
        hourInput.value = String(hora).padStart(2, '0');
        minInput.value = String(minuto).padStart(2, '0');
    }

    hourUp.addEventListener('click', () => {
        hora = hora < 23 ? hora + 1 : 0;
        atualizar();
    });

    hourDown.addEventListener('click', () => {
        hora = hora > 0 ? hora - 1 : 23;
        atualizar();
    });

    minUp.addEventListener('click', () => {
        minuto = minuto < 59 ? minuto + 1 : 0;
        atualizar();
    });

    minDown.addEventListener('click', () => {
        minuto = minuto > 0 ? minuto - 1 : 59;
        atualizar();
    });

    function validarCampo(input, max, field) {
        input.addEventListener('change', () => {
            let v = parseInt(input.value, 10);
            if (isNaN(v)) v = 0;
            v = Math.min(Math.max(v, 0), max);
            if (field === 'min') {
                minuto = v;
            } else {
                hora = v;
            }
            atualizar();
        });
        input.addEventListener('input', () => {
            let v = input.value.replace(/[^0-9]/g, '');
            if (v.length > 2) v = v.slice(0, 2);
            input.value = v;
        });
    }

    validarCampo(hourInput, 23, 'hora');
    validarCampo(minInput, 59, 'min');

    return {
        getValue: () => `${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`,
        setValue: (v) => {
            if (typeof v === 'string' && v.includes(':')) {
                const [h, m] = v.split(':').map(n => parseInt(n, 10));
                hora = isNaN(h) ? 0 : Math.min(Math.max(h, 0), 23);
                minuto = isNaN(m) ? 0 : Math.min(Math.max(m, 0), 59);
            } else {
                hora = Math.min(Math.max(parseInt(v, 10) || 0, 0), 23);
                minuto = 0;
            }
            atualizar();
        }
    };
}

function criarDurationSpinner(container, valorInicial) {
    container.innerHTML = `
        <div class="spinner-group">
            <button class="spinner-btn up" type="button"></button>
            <input type="text" class="spinner-input" value="${valorInicial}" maxlength="2" inputmode="numeric">
            <button class="spinner-btn down" type="button"></button>
        </div>
        <span class="duration-unit">h</span>
    `;
    const input = container.querySelector('.spinner-input');
    const upBtn = container.querySelector('.spinner-btn.up');
    const downBtn = container.querySelector('.spinner-btn.down');
    let valor = valorInicial;

    function atualizar() {
        input.value = valor;
    }

    upBtn.addEventListener('click', () => {
        valor = valor < 24 ? valor + 1 : 1;
        atualizar();
    });

    downBtn.addEventListener('click', () => {
        valor = valor > 1 ? valor - 1 : 24;
        atualizar();
    });

    input.addEventListener('change', () => {
        let v = parseInt(input.value, 10);
        if (isNaN(v)) v = 1;
        valor = Math.min(Math.max(v, 1), 24);
        atualizar();
    });

    input.addEventListener('input', () => {
        let v = input.value.replace(/[^0-9]/g, '');
        if (v.length > 2) v = v.slice(0, 2);
        input.value = v;
    });

    return {
        getValue: () => valor,
        setValue: (v) => { valor = v; atualizar(); }
    };
}

function getTimePickerValue(pickerId) {
    const container = document.getElementById(pickerId);
    if (!container) return '';
    const inputs = container.querySelectorAll('.spinner-input');
    if (inputs.length === 0) return '';
    if (inputs.length === 2) {
        return `${inputs[0].value}:${inputs[1].value}`;
    }
    return inputs[0].value;
}

function setTimePickerValue(pickerId, valor) {
    const container = document.getElementById(pickerId);
    if (!container) return;
    const inputs = container.querySelectorAll('.spinner-input');
    if (inputs.length === 0) return;
    if (typeof valor === 'string' && valor.includes(':')) {
        const [h, m] = valor.split(':');
        inputs[0].value = String(parseInt(h, 10) || 0).padStart(2, '0');
        if (inputs[1]) inputs[1].value = String(parseInt(m, 10) || 0).padStart(2, '0');
    } else {
        inputs[0].value = String(valor || 0).padStart(2, '0');
        if (inputs[1]) inputs[1].value = '00';
    }
}

function getDurationSpinnerValue(spinnerId) {
    const input = document.querySelector(`#${spinnerId} .spinner-input`);
    return input ? input.value : '';
}

function setDurationSpinnerValue(spinnerId, valor) {
    const input = document.querySelector(`#${spinnerId} .spinner-input`);
    if (input) input.value = valor;
}

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
    preencherSeletorHorasRotinaDia();
    preencherDurationSpinners();
    configurarEventos();
    configurarRotinas();
    configurarRotinaDiaForm();
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
            
            if (tabId === 'dia') {
                atualizarTituloDia();
                renderizarGradeHoras();
                carregarEventosDia();
                carregarRotinaDia(estadoApp.dataSelecionada);
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

    if (container.children.length > 0) {
        limparGradeHoras();
        return;
    }

    // Cabeçalho da grade de horas
    const cabecalho = document.createElement('div');
    cabecalho.className = 'grade-header';

    const cabecalhoHora = document.createElement('div');
    cabecalhoHora.className = 'hora-label';
    cabecalhoHora.textContent = 'Hora';

    const cabecalhoConteudo = document.createElement('div');
    cabecalhoConteudo.className = 'hora-eventos';
    cabecalhoConteudo.textContent = 'Horários';

    cabecalho.appendChild(cabecalhoHora);
    cabecalho.appendChild(cabecalhoConteudo);
    container.appendChild(cabecalho);

    for (let h = 0; h <= 23; h++) {
        const bloco = document.createElement('div');
        bloco.className = 'bloco-hora';

        const horaLabel = document.createElement('div');
        horaLabel.className = 'hora-label';
        horaLabel.textContent = String(h).padStart(2, '0') + ':00';

        const horaEventos = document.createElement('div');
        horaEventos.className = 'hora-eventos';
        horaEventos.id = `hora-${h}`;
        horaEventos.dataset.hora = String(h);
        horaEventos.addEventListener('click', (e) => {
            if (e.target.closest('.evento-card, .rotina-card')) return;
            abrirModalCriarEventoNaGrade(h);
        });

        bloco.appendChild(horaLabel);
        bloco.appendChild(horaEventos);
        container.appendChild(bloco);
    }
}

function limparGradeHoras() {
    for (let h = 0; h <= 23; h++) {
        const el = document.getElementById(`hora-${h}`);
        if (el) el.innerHTML = '';
    }
}

function criarEventoCard(evento) {
    const card = document.createElement('div');
    card.className = 'evento-card';
    card.style.borderLeftColor = evento.cor;

    card.innerHTML = `
        <div class="evento-titulo">${escapeHTML(evento.titulo)}</div>
        ${evento.descricao ? `<div class="evento-desc">${escapeHTML(evento.descricao.substring(0, 45))}${evento.descricao.length > 45 ? '...' : ''}</div>` : ''}
    `;

    card.addEventListener('click', () => abrirDetalhesEvento(evento));
    return card;
}

function criarRotinaCard(rotina) {
    const card = document.createElement('div');
    card.className = 'rotina-card';
    card.style.borderLeftColor = rotina.cor;

    const diasNomes = JSON.parse(rotina.dias_semana).map(d => nomesDiasCompletos[d] || '').join(', ');

    card.innerHTML = `
        <div class="rotina-card-titulo">${escapeHTML(rotina.titulo)}</div>
        ${rotina.descricao ? `<div class="rotina-card-desc">${escapeHTML(rotina.descricao.substring(0, 45))}${rotina.descricao.length > 45 ? '...' : ''}</div>` : ''}
        <div class="rotina-card-info">${escapeHTML(diasNomes)}</div>
        <div class="rotina-card-horario">${escapeHTML(rotina.hora_inicio)} - ${escapeHTML(buscarFimHorario(rotina.hora_inicio, rotina.duracao))}</div>
    `;

    card.addEventListener('click', () => abrirDetalhesRotina(rotina));
    return card;
}

function renderizarRotinasNaGrade() {
    document.querySelectorAll('#hours-grid .rotina-card').forEach(card => card.remove());

    (estadoApp.rotinasDoDia || []).forEach(rotina => {
        const hora = parseInt(rotina.hora_inicio.split(':')[0], 10);
        const container = document.getElementById(`hora-${hora}`);

        if (container) {
            container.appendChild(criarRotinaCard(rotina));
        }
    });
}

function escapeHTML(texto) {
    const mapa = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return String(texto || '').replace(/[&<>"']/g, caractere => mapa[caractere]);
}

async function carregarEventosDia() {
    try {
        const response = await fetch(`/api/eventos/${estadoApp.dataSelecionada}`);
        const eventos = await response.json();

        limparGradeHoras();

        eventos.forEach(evento => {
            const hora = parseInt(evento.hora.split(':')[0]);
            const container = document.getElementById(`hora-${hora}`);

            if (container) {
                container.appendChild(criarEventoCard(evento));
            }
        });

        renderizarRotinasNaGrade();

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
        renderizarRotinasNaGrade();
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
    } else {
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
    
    updateRotinaDiaFormState(data);
}

function buscarFimHorario(inicio, duracao) {
    if (!inicio || !duracao) return '';
    const [hora, min] = inicio.split(':').map(Number);
    const totalMin = hora * 60 + min + (duracao * 60);
    const hFinal = Math.floor(totalMin / 60) % 24;
    const mFinal = totalMin % 60;
    return `${String(hFinal).padStart(2, '0')}:${String(mFinal).padStart(2, '0')}`;
}

function toggleRotinaDiaForm() {
    const form = document.getElementById('form-evento-rotina-dia');
    const btn = document.getElementById('rotina-dia-toggle');
    const isHidden = form.style.display === 'none';
    form.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
        btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Ocultar';
    } else {
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Evento';
    }
}

function updateRotinaDiaFormState(data) {
    const form = document.getElementById('form-evento-rotina-dia');
    const btn = document.getElementById('rotina-dia-toggle');
    if (!form || !btn) return;
    
    form.style.display = 'none';
    btn.innerHTML = '<i class="fa-solid fa-plus"></i> Adicionar Evento';
    
    document.getElementById('rotina-dia-titulo').value = '';
    document.getElementById('rotina-dia-descricao').value = '';
    setDurationSpinnerValue('rotina-dia-duracao-spinner', '2');
    document.getElementById('rotina-dia-data').value = data || '';
}

async function salvarEventoRotinaDia(e) {
    e.preventDefault();
    
    const data = document.getElementById('rotina-dia-data').value;
    const hora = getTimePickerValue('rotina-dia-hora-picker');
    const titulo = document.getElementById('rotina-dia-titulo').value;
    const descricao = document.getElementById('rotina-dia-descricao').value;
    const duracao = getDurationSpinnerValue('rotina-dia-duracao-spinner');
    
    if (!data || !hora || !titulo) {
        alert('Preenchimento obrigatório: Data, Hora e Título');
        return;
    }
    
    try {
        const response = await fetch('/api/evento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, hora, titulo, descricao, duracao, cor: '#3498db' })
        });
        
        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));
            alert(erro.error || 'Erro ao salvar evento');
            return;
        }
        
        await carregarMeses();
        await carregarEventosDia();
        await carregarRotinaDia(data);
        renderizarCalendario();
        updateRotinaDiaFormState(data);
        
    } catch (erro) {
        console.error('Erro ao salvar evento:', erro);
        alert('Erro ao salvar evento');
    }
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
    const container = document.getElementById('evento-hora-picker');
    if (!container || container.children.length > 0) return;
    criarTimePicker(container, 0);
}

function preencherDurationSpinners() {
    const spinners = [
        { id: 'evento-duracao-spinner', valor: 1 },
        { id: 'rotina-dia-duracao-spinner', valor: 2 },
        { id: 'rotina-duracao-spinner', valor: 2 }
    ];

    spinners.forEach(({ id, valor }) => {
        const container = document.getElementById(id);
        if (container && container.children.length === 0) {
            criarDurationSpinner(container, valor);
        }
    });
}

async function salvarEvento() {
    const data = document.getElementById('evento-data').value;
    const hora = getTimePickerValue('evento-hora-picker');
    const titulo = document.getElementById('evento-titulo').value;
    const descricao = document.getElementById('evento-descricao').value;
    const duracao = getDurationSpinnerValue('evento-duracao-spinner');
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
    setDurationSpinnerValue('evento-duracao-spinner', '1');
    document.getElementById('evento-cor').value = '#3498db';
    estadoApp.eventoEmEdicao = null;
}

function abrirModalCriarEventoNaGrade(hora) {
    const data = estadoApp.dataSelecionada || document.getElementById('evento-data').value || document.getElementById('data-selecionada').value;
    const horaFormatada = `${String(hora).padStart(2, '0')}:00`;
    const modal = document.getElementById('modal-evento');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="modal-intro">Adicionar evento em ${escapeHTML(formatarData(data))} às ${escapeHTML(horaFormatada)}</div>
        <div style="margin-bottom: 15px;">
            <label>Data</label>
            <input type="date" value="${escapeHTML(data)}" disabled>
        </div>
        <div style="margin-bottom: 15px;">
            <label>Hora</label>
            <input type="text" value="${escapeHTML(horaFormatada)}" disabled>
        </div>
        <div style="margin-bottom: 15px;">
            <label>Título *</label>
            <input type="text" id="grade-evento-titulo" placeholder="Adicionar título" autofocus>
        </div>
        <div style="margin-bottom: 15px;">
            <label>Descrição</label>
            <textarea id="grade-evento-descricao" placeholder="Adicionar descrição"></textarea>
        </div>
        <div style="margin-bottom: 15px;">
            <label>Duração</label>
            <select id="grade-evento-duracao">
                <option value="1">30 min</option>
                <option value="2">1 hora</option>
                <option value="3">1h30min</option>
                <option value="4">2 horas</option>
                <option value="5">2h30min</option>
                <option value="6">3 horas</option>
                <option value="7">3h30min</option>
                <option value="8">4 horas</option>
                <option value="9">4h30min</option>
                <option value="10">5 horas</option>
                <option value="11">5h30min</option>
                <option value="12">6 horas</option>
                <option value="13">6h30min</option>
                <option value="14">7 horas</option>
                <option value="15">7h30min</option>
                <option value="16">8 horas</option>
                <option value="17">8h30min</option>
                <option value="18">9 horas</option>
                <option value="19">9h30min</option>
                <option value="20">10 horas</option>
                <option value="21">10h30min</option>
                <option value="22">11 horas</option>
                <option value="23">11h30min</option>
                <option value="24">12 horas</option>
            </select>
        </div>
        <div style="margin-bottom: 15px;">
            <label>Cor</label>
            <input type="color" id="grade-evento-cor" value="#3498db" style="width: 100%; height: 40px; border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer;">
        </div>
        <div class="modal-actions">
            <button id="btn-salvar-evento-grade" class="btn-primary" style="flex: 1;">Salvar</button>
            <button onclick="fecharModal()" class="btn-secondary" style="flex: 1;">Cancelar</button>
        </div>
    `;

    document.getElementById('btn-salvar-evento-grade').addEventListener('click', salvarEventoDaGrade);

    modal.classList.add('active');
}

async function salvarEventoDaGrade() {
    const data = estadoApp.dataSelecionada || document.getElementById('evento-data').value || document.getElementById('data-selecionada').value;
    const horaInput = document.querySelector('#modal-body input[type="text"]');
    const titulo = document.getElementById('grade-evento-titulo').value;
    const descricao = document.getElementById('grade-evento-descricao').value;
    const duracao = document.getElementById('grade-evento-duracao').value;
    const cor = document.getElementById('grade-evento-cor').value;

    if (!data || !titulo) {
        alert('Preenchimento obrigatório: Data e Título');
        return;
    }

    try {
        const response = await fetch('/api/evento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data, hora: horaInput.value, titulo, descricao, duracao, cor })
        });

        if (!response.ok) {
            const erro = await response.json().catch(() => ({}));
            alert(erro.error || 'Erro ao salvar evento');
            return;
        }

        await carregarMeses();
        await carregarEventosDia();
        await carregarRotinaDia(data);
        renderizarCalendario();
        fecharModal();

    } catch (erro) {
        console.error('Erro ao salvar evento:', erro);
        alert('Erro ao salvar evento');
    }
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

function abrirDetalhesRotina(rotina) {
    const modal = document.getElementById('modal-evento');
    const modalBody = document.getElementById('modal-body');
    const diasNomes = JSON.parse(rotina.dias_semana).map(d => nomesDiasCompletos[d] || '').join(', ');

    modalBody.innerHTML = `
        <div style="margin-bottom: 15px;">
            <label>Título</label>
            <input type="text" value="${escapeHTML(rotina.titulo)}" disabled>
        </div>
        <div style="margin-bottom: 15px;">
            <label>Descrição</label>
            <textarea disabled>${escapeHTML(rotina.descricao || '')}</textarea>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div>
                <label>Dias</label>
                <input type="text" value="${escapeHTML(diasNomes)}" disabled>
            </div>
            <div>
                <label>Horário</label>
                <input type="text" value="${escapeHTML(rotina.hora_inicio)} - ${escapeHTML(buscarFimHorario(rotina.hora_inicio, rotina.duracao))}" disabled>
            </div>
        </div>
        <div style="margin-bottom: 15px;">
            <label>Período</label>
            <input type="text" value="${escapeHTML(rotina.data_inicio)}${rotina.data_fim ? ' até ' + escapeHTML(rotina.data_fim) : ''}" disabled>
        </div>
        <div class="modal-actions">
            <button id="btn-gerar-eventos-grade" class="btn-primary" style="flex: 1;">Gerar eventos</button>
            <button id="btn-fechar-rotina-grade" class="btn-secondary" style="flex: 1;">Fechar</button>
        </div>
    `;

    document.getElementById('btn-gerar-eventos-grade').addEventListener('click', () => gerarEventosRotina(rotina.id));
    document.getElementById('btn-fechar-rotina-grade').addEventListener('click', fecharModal);

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
function preencherSeletorHorasRotinaDia() {
    const container = document.getElementById('rotina-dia-hora-picker');
    if (!container || container.children.length > 0) return;
    criarTimePicker(container, 0);
}

function configurarRotinaDiaForm() {
    const toggleBtn = document.getElementById('rotina-dia-toggle');
    const form = document.getElementById('form-evento-rotina-dia');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => toggleRotinaDiaForm());
    }
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarEventoRotinaDia(e);
        });
    }
    
    preencherSeletorHorasRotinaDia();
}

function configurarRotinas() {
    preencherSeletorHorasRotina();
    
    document.getElementById('form-rotina').addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarRotina();
    });
    
    document.getElementById('btn-cancelar-rotina').addEventListener('click', () => {
        cancelarEdicaoRotina();
    });
    
    const btnLote = document.getElementById('btn-lote-rotina');
    const btnDeletarTodas = document.getElementById('btn-deletar-todas-rotinas');
    
    if (btnLote) {
        btnLote.addEventListener('click', () => abrirBatchRotina());
    }
    
    if (btnDeletarTodas) {
        btnDeletarTodas.addEventListener('click', () => deletarTodasRotinas());
    }
    
    const btnSalvarLote = document.getElementById('btn-salvar-lote-rotina');
    if (btnSalvarLote) {
        btnSalvarLote.addEventListener('click', () => salvarLoteRotinas());
    }
}

function preencherSeletorHorasRotina() {
    const container = document.getElementById('rotina-hora-picker');
    if (!container || container.children.length > 0) return;
    criarTimePicker(container, 0);
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
                <div class="rotina-item-info">${diasSelecionados} às ${r.hora_inicio} (${r.duracao}h)</div>
                <div class="rotina-item-info">${r.data_inicio}${r.data_fim ? ' até ' + r.data_fim : ''}</div>
                <div class="rotina-actions">
                    <button class="btn-primary btn-sm" onclick="editarRotina(${r.id})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="btn-secondary btn-sm" onclick="gerarEventosRotina(${r.id})"><i class="fa-solid fa-calendar-plus"></i> Gerar</button>
                    <button class="btn-secondary btn-sm danger" onclick="deletarRotina(${r.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            
            container.appendChild(item);
        });
    } catch (erro) {
        console.error('Erro ao carregar rotinas:', erro);
    }
}

window.editarRotina = async function(id) {
    try {
        const response = await fetch('/api/rotinas');
        const rotinas = await response.json();
        const rotina = rotinas.find(r => r.id === id);
        
        if (!rotina) {
            alert('Rotina não encontrada');
            return;
        }
        
        document.getElementById('rotina-titulo').value = rotina.titulo;
        document.getElementById('rotina-descricao').value = rotina.descricao || '';
        document.getElementById('rotina-cor').value = rotina.cor;
        setTimePickerValue('rotina-hora-picker', rotina.hora_inicio);
        setDurationSpinnerValue('rotina-duracao-spinner', rotina.duracao);
        document.getElementById('rotina-data-inicio').value = rotina.data_inicio;
        document.getElementById('rotina-data-fim').value = rotina.data_fim || '';
        
        const diasSemana = JSON.parse(rotina.dias_semana);
        document.querySelectorAll('.weekday-chk input[type="checkbox"]').forEach(cb => {
            cb.checked = diasSemana.includes(parseInt(cb.value));
        });
        
        document.getElementById('btn-salvar-rotina').textContent = 'Atualizar';
        document.getElementById('btn-cancelar-rotina').style.display = 'inline-flex';
        
        window.editarRotinaId = id;
        
        document.getElementById('rotina-titulo').focus();
    } catch (erro) {
        console.error('Erro ao carregar rotina para edição:', erro);
        alert('Erro ao carregar rotina');
    }
}

window.cancelarEdicaoRotina = function() {
    limparFormularioRotina();
    document.getElementById('btn-salvar-rotina').textContent = 'Criar Rotina';
    document.getElementById('btn-cancelar-rotina').style.display = 'none';
    window.editarRotinaId = null;
}

async function salvarRotina() {
    const titulo = document.getElementById('rotina-titulo').value;
    const descricao = document.getElementById('rotina-descricao').value;
    const cor = document.getElementById('rotina-cor').value;
    const hora_inicio = getTimePickerValue('rotina-hora-picker');
    const duracao = getDurationSpinnerValue('rotina-duracao-spinner');
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
        const idEdicao = window.editarRotinaId;
        
        if (idEdicao) {
            await fetch(`/api/rotina/${idEdicao}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo, descricao, cor, dias_semana: diasSemana,
                    hora_inicio, duracao, data_inicio, data_fim: data_fim || null
                })
            });
            
            window.editarRotinaId = null;
            document.getElementById('btn-salvar-rotina').textContent = 'Criar Rotina';
            document.getElementById('btn-cancelar-rotina').style.display = 'none';
        } else {
            await fetch('/api/rotina', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titulo, descricao, cor, dias_semana: diasSemana,
                    hora_inicio, duracao, data_inicio, data_fim: data_fim || null
                })
            });
        }
        
        limparFormularioRotina();
        carregarRotinas();
    } catch (erro) {
        console.error('Erro ao salvar rotina:', erro);
        alert('Erro ao salvar rotina');
    }
}

window.deletarTodasRotinas = async function() {
    if (!confirm('Tem certeza que deseja deletar TODAS as rotinas? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        await fetch('/api/rotinas', { method: 'DELETE' });
        carregarRotinas();
        limparFormularioRotina();
        document.getElementById('btn-salvar-rotina').textContent = 'Criar Rotina';
        document.getElementById('btn-cancelar-rotina').style.display = 'none';
        window.editarRotinaId = null;
    } catch (erro) {
        console.error('Erro ao deletar rotinas:', erro);
        alert('Erro ao deletar rotinas');
    }
}

window.abrirBatchRotina = function() {
    const section = document.getElementById('rotinas-batch-section');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
    
    if (section.style.display === 'none') {
        document.getElementById('batch-rotinas-container').innerHTML = '';
        return;
    }
    
    adicionarCampoRotinaLote();
    adicionarCampoRotinaLote();
}

window.adicionarCampoRotinaLote = function() {
    const container = document.getElementById('batch-rotinas-container');
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'batch-rotina-item';
    div.style.cssText = 'background: var(--hover-bg); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid var(--primary);';
    
    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 12px; color: var(--text-primary);">Rotina ${index + 1}</strong>
            <button type="button" class="btn-secondary btn-sm danger" onclick="this.closest('.batch-rotina-item').remove()"><i class="fa-solid fa-times"></i></button>
        </div>
        <div class="form-row" style="grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div class="form-group compact">
                <label style="font-size: 10px; color: var(--text-secondary);">Título *</label>
                <input type="text" class="batch-titulo" placeholder="Título" required>
            </div>
            <div class="form-group compact">
                <label style="font-size: 10px; color: var(--text-secondary);">Dias</label>
                <select class="batch-dia" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: var(--event-bg); color: var(--text-primary); font-size: 11px;">
                    <option value="0">Dom</option>
                    <option value="1">Seg</option>
                    <option value="2">Ter</option>
                    <option value="3">Qua</option>
                    <option value="4">Qui</option>
                    <option value="5">Sex</option>
                    <option value="6">Sab</option>
                </select>
            </div>
        </div>
        <div class="form-row" style="grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div class="form-group compact">
                <label style="font-size: 10px; color: var(--text-secondary);">Hora</label>
                <input type="time" class="batch-hora" value="09:00" required>
            </div>
            <div class="form-group compact">
                <label style="font-size: 10px; color: var(--text-secondary);">Duração</label>
                <select class="batch-duracao" style="width: 100%; padding: 6px; border-radius: 6px; border: 1px solid var(--border); background: var(--event-bg); color: var(--text-primary); font-size: 11px;">
                    <option value="1">30min</option>
                    <option value="2" selected>1h</option>
                    <option value="3">1h30</option>
                    <option value="4">2h</option>
                    <option value="6">3h</option>
                    <option value="8">4h</option>
                </select>
            </div>
            <div class="form-group compact">
                <label style="font-size: 10px; color: var(--text-secondary);">Data Início</label>
                <input type="date" class="batch-inicio" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
        </div>
        <div class="form-row" style="grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group compact">
                <label style="font-size: 10px; color: var(--text-secondary);">Data Fim</label>
                <input type="date" class="batch-fim" value="2026-12-31">
            </div>
            <div class="form-group compact">
                <label style="font-size: 10px; color: var(--text-secondary);">Descrição</label>
                <input type="text" class="batch-desc" placeholder="(opcional)">
            </div>
        </div>
    `;
    
    container.appendChild(div);
}

window.salvarLoteRotinas = async function() {
    const rotinas = [];
    
    document.querySelectorAll('.batch-rotina-item').forEach(item => {
        const titulo = item.querySelector('.batch-titulo').value.trim();
        const dia = parseInt(item.querySelector('.batch-dia').value);
        const hora = item.querySelector('.batch-hora').value;
        const duracao = parseInt(item.querySelector('.batch-duracao').value);
        const data_inicio = item.querySelector('.batch-inicio').value;
        const data_fim = item.querySelector('.batch-fim').value;
        const descricao = item.querySelector('.batch-desc').value.trim();
        
        if (!titulo || !hora || !data_inicio) {
            return;
        }
        
        rotinas.push({
            titulo,
            descricao,
            cor: '#4285f4',
            dias_semana: [dia],
            hora_inicio: hora,
            duracao,
            data_inicio,
            data_fim: data_fim || null
        });
    });
    
    if (rotinas.length === 0) {
        alert('Preencha ao menos uma rotina com título, dia, hora e data início');
        return;
    }
    
    try {
        const response = await fetch('/api/rotinas/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rotinas })
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            document.getElementById('rotinas-batch-section').style.display = 'none';
            document.getElementById('batch-rotinas-container').innerHTML = '';
            carregarRotinas();
            alert(`${resultado.ids.length} rotina(s) criada(s) com sucesso!`);
        } else {
            alert(resultado.error || 'Erro ao criar rotinas');
        }
    } catch (erro) {
        console.error('Erro ao salvar lote:', erro);
        alert('Erro ao salvar rotinas');
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
    setTimePickerValue('rotina-hora-picker', '');
    setDurationSpinnerValue('rotina-duracao-spinner', '2');
    document.getElementById('rotina-data-inicio').value = '';
    document.getElementById('rotina-data-fim').value = '';
    document.querySelectorAll('.weekday-chk input[type="checkbox"]').forEach(cb => cb.checked = false);
}
