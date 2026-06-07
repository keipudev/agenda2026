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

@app.route('/api/meses')
def get_meses():
    """Retorna calendário dos meses até final de 2026"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Pega todos os eventos para saber quais dias têm eventos
    cursor.execute('SELECT DISTINCT data FROM eventos')
    datas_com_eventos = set(row[0] for row in cursor.fetchall())
    conn.close()
    
    meses = []
    hoje = datetime(2026, 1, 1)
    final = datetime(2026, 12, 31)
    
    while hoje <= final:
        primeiro_dia = datetime(hoje.year, hoje.month, 1)
        if hoje.month == 12:
            ultimo_dia = datetime(hoje.year, 12, 31)
        else:
            ultimo_dia = datetime(hoje.year, hoje.month + 1, 1) - timedelta(days=1)
        
        # Usa isoweekday() para alinhar com calendário que começa no Domingo (1=Dom, 7=Sáb)
        dias = []
        primeiro_dow = primeiro_dia.isoweekday()
        
        # Dias vazios no início (para começar no Domingo)
        # Se 1º é domingo (isoweekday=1), precisa preencher 0 dias vazios
        # Se 1º é segunda (isoweekday=2), precisa preencher 1 dia vazio (Domingo)
        for _ in range(primeiro_dow - 1):
            dias.append(None)
        
        # Dias do mês
        for d in range(1, num_dias + 1):
            data_str = primeiro_dia.replace(day=d).strftime('%Y-%m-%d')
            dias.append({
                'dia': d,
                'data': data_str,
                'tem_eventos': data_str in datas_com_eventos
            })
        
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
