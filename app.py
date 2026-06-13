from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import sqlite3
import json
import os

app = Flask(__name__)

# Caminho do banco de dados
DB_PATH = 'database/agenda.db'

def init_db():
    """Inicializa o banco de dados"""
    if not os.path.exists('database'):
        os.makedirs('database')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            hora TEXT NOT NULL,
            titulo TEXT NOT NULL,
            descricao TEXT,
            duracao INTEGER DEFAULT 1,
            cor TEXT DEFAULT '#3498db',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rotinas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descricao TEXT,
            cor TEXT DEFAULT '#4285f4',
            dias_semana TEXT NOT NULL,
            hora_inicio TEXT NOT NULL,
            duracao INTEGER DEFAULT 2,
            data_inicio TEXT NOT NULL,
            data_fim TEXT,
            ativa INTEGER DEFAULT 1,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db():
    """Retorna conexão com o banco de dados"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/api/eventos/<data>')
def get_eventos(data):
    """Retorna eventos de um dia específico"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM eventos 
        WHERE data = ? 
        ORDER BY hora
    ''', (data,))
    
    eventos = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(eventos)

@app.route('/api/evento', methods=['POST'])
def criar_evento():
    """Cria novo evento"""
    data = request.json
    
    # Validação de dados - verificar campos obrigatórios primeiro
    if not data.get('data') or not data.get('hora'):
        return jsonify({'error': 'Data e hora são obrigatórias'}), 400
    
    if not data.get('titulo'):
        return jsonify({'error': 'Título é obrigatório'}), 400
    
    try:
        datetime.strptime(data['data'], '%Y-%m-%d')
        datetime.strptime(data['hora'], '%H:%M')
    except ValueError:
        return jsonify({'error': 'Data ou hora inválida'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO eventos (data, hora, titulo, descricao, duracao, cor)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        data['data'],
        data['hora'],
        data['titulo'],
        data.get('descricao', ''),
        data.get('duracao', 1),
        data.get('cor', '#3498db')
    ))
    
    conn.commit()
    id_evento = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': id_evento, 'status': 'sucesso'})

@app.route('/api/evento/<int:id>', methods=['PUT'])
def atualizar_evento(id):
    """Atualiza um evento existente"""
    data = request.json
    
    # Validação
    if 'titulo' not in data:
        return jsonify({'error': 'Título é obrigatório'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE eventos 
        SET titulo=?, descricao=?, duracao=?, cor=?
        WHERE id=?
    ''', (
        data['titulo'],
        data.get('descricao', ''),
        data.get('duracao', 1),
        data.get('cor', '#3498db'),
        id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'atualizado'})

@app.route('/api/evento/<int:id>', methods=['DELETE'])
def deletar_evento(id):
    """Deleta um evento"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM eventos WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'deletado'})

# Rotas API para Rotinas
@app.route('/api/rotinas')
def get_rotinas():
    """Retorna todas as rotinas"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM rotinas ORDER BY data_inicio')
    rotinas = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify(rotinas)

@app.route('/api/rotinas/<data>')
def get_rotinas_do_dia(data):
    """Retorna rotinas ativas para um dia específico"""
    try:
        datetime.strptime(data, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Data inválida'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM rotinas WHERE ativa = 1')
    rotinas = cursor.fetchall()
    conn.close()
    
    data_ref = datetime.strptime(data, '%Y-%m-%d')
    dia_semana = (data_ref.weekday() + 1) % 7
    
    rotinas_do_dia = []
    for rotina in rotinas:
        rotina = dict(rotina)
        dias_semana = json.loads(rotina['dias_semana'])
        
        if dia_semana not in dias_semana:
            continue
        
        data_inicio = datetime.strptime(rotina['data_inicio'], '%Y-%m-%d')
        data_fim = rotina['data_fim']
        if data_fim:
            data_fim = datetime.strptime(data_fim, '%Y-%m-%d')
        else:
            data_fim = None
        
        if data_fim and data_ref > data_fim:
            continue
        if data_ref < data_inicio:
            continue
        
        rotinas_do_dia.append(rotina)
    
    return jsonify(rotinas_do_dia)

@app.route('/api/rotina', methods=['POST'])
def criar_rotina():
    """Cria nova rotina"""
    data = request.json
    
    # Validação
    if not data.get('titulo') or not data.get('dias_semana'):
        return jsonify({'error': 'Título e dias da semana são obrigatórios'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO rotinas (titulo, descricao, cor, dias_semana, hora_inicio, duracao, data_inicio, data_fim, ativa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['titulo'],
        data.get('descricao', ''),
        data.get('cor', '#4285f4'),
        json.dumps(data['dias_semana']),
        data['hora_inicio'],
        data.get('duracao', 2),
        data['data_inicio'],
        data.get('data_fim') or None,
        1
    ))
    
    conn.commit()
    id_rotina = cursor.lastrowid
    conn.close()
    
    return jsonify({'id': id_rotina, 'status': 'sucesso'})

@app.route('/api/rotina/<int:id>', methods=['PUT'])
def atualizar_rotina(id):
    """Atualiza uma rotina existente"""
    data = request.json
    
    if 'titulo' not in data:
        return jsonify({'error': 'Título é obrigatório'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE rotinas 
        SET titulo=?, descricao=?, cor=?, dias_semana=?, hora_inicio=?, duracao=?, data_inicio=?, data_fim=?, ativa=?
        WHERE id=?
    ''', (
        data['titulo'],
        data.get('descricao', ''),
        data.get('cor', '#4285f4'),
        json.dumps(data.get('dias_semana', [])),
        data.get('hora_inicio'),
        data.get('duracao', 2),
        data.get('data_inicio'),
        data.get('data_fim') or None,
        data.get('ativa', 1),
        id
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'atualizado'})

@app.route('/api/rotina/<int:id>', methods=['DELETE'])
def deletar_rotina(id):
    """Deleta uma rotina"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM rotinas WHERE id = ?', (id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'deletado'})

@app.route('/api/rotinas', methods=['DELETE'])
def deletar_todas_rotinas():
    """Deleta todas as rotinas"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM rotinas')
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'todas_deletadas'})

@app.route('/api/rotinas/batch', methods=['POST'])
def criar_rotinas_batch():
    """Cria múltiplas rotinas de uma vez"""
    data = request.json or {}
    rotinas = data.get('rotinas', [])
    
    if not rotinas:
        return jsonify({'error': 'Nenhuma rotina fornecida'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    ids_criados = []
    for rotina in rotinas:
        if not rotina.get('titulo') or not rotina.get('dias_semana'):
            continue
        
        cursor.execute('''
            INSERT INTO rotinas (titulo, descricao, cor, dias_semana, hora_inicio, duracao, data_inicio, data_fim, ativa)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            rotina['titulo'],
            rotina.get('descricao', ''),
            rotina.get('cor', '#4285f4'),
            json.dumps(rotina.get('dias_semana', [])),
            rotina.get('hora_inicio', '09:00'),
            rotina.get('duracao', 2),
            rotina.get('data_inicio', datetime.now().strftime('%Y-%m-%d')),
            rotina.get('data_fim') or None,
            1
        ))
        ids_criados.append(cursor.lastrowid)
    
    conn.commit()
    conn.close()
    
    return jsonify({'ids': ids_criados, 'status': 'sucesso'})

@app.route('/api/rotina/<int:id>/gerar', methods=['POST'])
def gerar_eventos_rotina(id):
    """Gera eventos a partir de uma rotina"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM rotinas WHERE id = ?', (id,))
    rotina = cursor.fetchone()
    
    if not rotina:
        conn.close()
        return jsonify({'error': 'Rotina não encontrada'}), 404
    
    rotina = dict(rotina)
    dias_semana = json.loads(rotina['dias_semana'])
    
    # Usar período do body se fornecido, senão usar da rotina
    body = request.json or {}
    data_inicio = body.get('data_inicio', rotina['data_inicio'])
    data_fim = body.get('data_fim', rotina['data_fim'])
    
    if not data_fim:
        data_fim = '2026-12-31'
    
    # Gerar datas
    try:
        inicio = datetime.strptime(data_inicio, '%Y-%m-%d')
        fim = datetime.strptime(data_fim, '%Y-%m-%d')
    except ValueError:
        conn.close()
        return jsonify({'error': 'Data inválida'}), 400
    
    count = 0
    atual = inicio
    
    # weekday() no Python: 0=Seg, 6=Dom - mas dias_semana usa 0=Dom, 6=Sab
    # precisamos converter
    while atual <= fim:
        # Converter: 0=Dom (dias_semana) -> 6 (weekday), 1=Seg -> 0, etc
        dow_em_js = atual.weekday()  # 0=Seg, 6=Dom
        dow_em_rotina = (dow_em_js + 1) % 7  # 0=Dom, 6=Sab
        
        if dow_em_rotina in dias_semana:
            data_str = atual.strftime('%Y-%m-%d')
            
            # Verificar se evento já existe
            cursor.execute('SELECT id FROM eventos WHERE data = ? AND hora = ? AND titulo = ?', 
                (data_str, rotina['hora_inicio'], rotina['titulo']))
            
            if not cursor.fetchone():
                cursor.execute('''
                    INSERT INTO eventos (data, hora, titulo, descricao, duracao, cor)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    data_str,
                    rotina['hora_inicio'],
                    rotina['titulo'],
                    rotina['descricao'],
                    rotina['duracao'],
                    rotina['cor']
                ))
                count += 1
        
        atual += timedelta(days=1)
    
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'sucesso', 'eventos_criados': count})

@app.route('/api/meses')
def get_meses():
    """Retorna calendário dos meses até final de 2026"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Pega todos os eventos para saber quais dias têm eventos
    cursor.execute('SELECT DISTINCT data FROM eventos')
    datas_com_eventos = set(row[0] for row in cursor.fetchall())
    
    # Pega todas as rotinas ativas para calcular dias com rotinas
    cursor.execute('SELECT * FROM rotinas WHERE ativa = 1')
    rotinas = cursor.fetchall()
    conn.close()
    
    # Calcula datas que têm rotinas ativas
    datas_com_rotinas = set()
    for rotina in rotinas:
        rotina = dict(rotina)
        dias_semana = json.loads(rotina['dias_semana'])
        
        try:
            data_inicio = datetime.strptime(rotina['data_inicio'], '%Y-%m-%d')
            data_fim = rotina['data_fim']
            if data_fim:
                data_fim = datetime.strptime(data_fim, '%Y-%m-%d')
            else:
                data_fim = datetime(2026, 12, 31)
        except (ValueError, TypeError):
            continue
        
        atual = data_inicio
        while atual <= data_fim:
            # Converter: 0=Dom (dias_semana) -> 6 (weekday), 1=Seg -> 0, etc
            dow_em_js = atual.weekday()
            dow_em_rotina = (dow_em_js + 1) % 7
            
            if dow_em_rotina in dias_semana:
                datas_com_rotinas.add(atual.strftime('%Y-%m-%d'))
            atual += timedelta(days=1)
    
    meses = []
    hoje = datetime(2026, 1, 1)
    final = datetime(2026, 12, 31)
    
    while hoje <= final:
        primeiro_dia = datetime(hoje.year, hoje.month, 1)
        if hoje.month == 12:
            ultimo_dia = datetime(hoje.year, 12, 31)
        else:
            ultimo_dia = datetime(hoje.year, hoje.month + 1, 1) - timedelta(days=1)
        
        # Calcula dias vazios no início para o calendário começar no Domingo
        dias = []
        num_dias = (ultimo_dia - primeiro_dia).days + 1
        primeiro_dow = primeiro_dia.weekday()  # 0=Seg, 6=Dom
        
        # Se queremos Domingo primeiro:
        # Segunda (weekday=0): 1 dia vazio (Dom)
        # Domingo (weekday=6): 0 dias vazios
        for _ in range((primeiro_dow + 1) % 7):
            dias.append(None)
        
        # Dias do mês
        for d in range(1, num_dias + 1):
            data_str = primeiro_dia.replace(day=d).strftime('%Y-%m-%d')
            dia_info = {
                'dia': d,
                'data': data_str,
                'tem_eventos': data_str in datas_com_eventos
            }
            if data_str in datas_com_rotinas:
                dia_info['tem_rotinas'] = True
            dias.append(dia_info)
        
        meses.append({
            'mes': primeiro_dia.strftime('%Y-%m'),
            'nome_mes': primeiro_dia.strftime('%B'),
            'ano': hoje.year,
            'dias': dias
        })
        
        hoje = ultimo_dia + timedelta(days=1)
    
    return jsonify(meses)

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('AGENDA_PORT', 5000))
    app.run(debug=True, port=port)
