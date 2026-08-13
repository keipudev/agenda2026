# Agenda API 2026

![Python](https://img.shields.io/badge/python-3.11%2B-blue)
![Flask](https://img.shields.io/badge/flask-2.3-green)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-3.1-red)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-green)

API REST em Flask para gerenciamento de agenda pessoal com suporte a eventos e rotinas.

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Flask 2.3 |
| **ORM** | SQLAlchemy 3.1 |
| **Banco** | SQLite (dev) / PostgreSQL (prod) |
| **API Docs** | OpenAPI-ready |
| **Validação** | Pydantic v2 |
| **CORS** | Flask-CORS |
| **Servidor** | Gunicorn (prod) / Flask dev server |
| **Container** | Docker + Docker Compose |
| **Qualidade** | pytest, black, flake8 |

## Estrutura

```
agenda2026/
├── app.py                 # Aplicação Flask + Models + Routes
├── requirements.txt       # Dependências Python
├── .env.example          # Variáveis de ambiente (template)
├── Dockerfile            # Imagem de produção
├── docker-compose.yml    # Orquestração Linux
├── docker-compose.windows.yml  # Orquestração Windows
├── README.md             # Documentação
├── AGENTS.md             # Comandos do projeto
├── GUIA_RAPIDO.md        # Guia rápido
├── ARQUITETURA.md        # Arquitetura
├── static/
│   ├── style.css
│   └── script.js
├── templates/
│   └── index.html
└── database/
    └── agenda.db         # SQLite (gerado automaticamente)
```

## Setup

### Pré-requisitos

- Python 3.11+
- pip
- Docker (opcional)

### Instalação local

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

pip install -r requirements.txt
cp .env.example .env
python app.py
```

### Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```bash
FLASK_DEBUG=0
AGENDA_PORT=5000
SECRET_KEY=super-secret-key
DATABASE_URL=sqlite:///database/agenda.db
```

## Execução

### Local

```bash
python app.py
```

Acesse: http://localhost:5000

### Docker (Linux)

```bash
docker-compose up -d
```

### Docker (Windows Containers)

```bash
docker-compose -f docker-compose.windows.yml up -d
```

### Windows Nativo

```powershell
windows\instalar_dependencias.bat
windows\executar_agenda_windows.bat
```

## API

### Eventos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/eventos/<data>` | Lista eventos do dia |
| POST | `/api/evento` | Cria evento |
| PUT | `/api/evento/<id>` | Atualiza evento |
| DELETE | `/api/evento/<id>` | Remove evento |

### Rotinas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/rotinas` | Lista todas as rotinas |
| GET | `/api/rotinas/<data>` | Rotinas do dia |
| POST | `/api/rotina` | Cria rotina |
| PUT | `/api/rotina/<id>` | Atualiza rotina |
| DELETE | `/api/rotina/<id>` | Remove rotina |
| DELETE | `/api/rotinas` | Remove todas |
| POST | `/api/rotinas/batch` | Cria rotinas em lote |
| POST | `/api/rotina/<id>/gerar` | Gera eventos a partir de rotina |

### Utilitários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/meses` | Estrutura de calendário 2026 |
| GET | `/health` | Health check |

### Exemplo de request

```bash
curl -X POST http://localhost:5000/api/evento \
  -H "Content-Type: application/json" \
  -d '{
    "data": "2026-06-07",
    "hora": "14:00",
    "titulo": "Reunião",
    "descricao": "Sprint review",
    "duracao": 2,
    "cor": "#4285f4"
  }'
```

## Modelos

### Evento

```python
{
    "id": 1,
    "data": "2026-06-07",
    "hora": "14:00",
    "titulo": "Reunião",
    "descricao": "Sprint review",
    "duracao": 2,
    "cor": "#4285f4",
    "criado_em": "2026-06-07T14:00:00"
}
```

### Rotina

```python
{
    "id": 1,
    "titulo": "Academia",
    "descricao": "Treino de segunda, quarta e sexta",
    "cor": "#34a853",
    "dias_semana": [1, 3, 5],
    "hora_inicio": "07:00",
    "duracao": 2,
    "data_inicio": "2026-01-01",
    "data_fim": "2026-12-31",
    "ativa": 1
}
```

## Desenvolvimento

### Qualidade de código

```bash
black .
flake8 .
pytest
```

### Testes

```bash
pytest -v
pytest --cov=app
```

## Docker

### Build

```bash
docker-compose build
```

### Logs

```bash
docker-compose logs -f
```

### Parar

```bash
docker-compose down
```

## Deploy

Para produção, recomenda-se:

1. Usar PostgreSQL ao invés de SQLite
2. Configurar `SECRET_KEY` forte
3. Rodar atrás de Nginx ou Cloudflare
4. Usar HTTPS
5. Configurar backup automático do banco

```bash
# Exemplo com PostgreSQL
export DATABASE_URL=postgresql://user:pass@host:5432/agenda2026
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `python app.py` | Executa em modo desenvolvimento |
| `AGENDA_PORT=5001 python app.py` | Porta customizada |
| `python -m py_compile app.py` | Verifica sintaxe |
| `pytest` | Executa testes |
| `black .` | Formata código |
| `flake8 .` | Lint |

## Roadmap

- [ ] Autenticação de usuários
- [ ] Exportação PDF/CSV
- [ ] Notificações
- [ ] Sincronização com Google Calendar
- [ ] API versionamento (/api/v1)

## Licença

MIT
