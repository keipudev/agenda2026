# Agenda 2026

API REST em Flask para gerenciamento de agenda pessoal com suporte a eventos e rotinas.

Este projeto está sendo desenvolvido com vibe coding.

## Stack

- Flask 2.3
- SQLAlchemy 3.1
- SQLite
- Pydantic v2
- Flask-CORS
- Gunicorn
- Docker + Docker Compose

## Estrutura

```
agenda2026/
├── app.py                      # Aplicacao Flask + Models + Routes
├── test_app.py                 # Testes automatizados
├── requirements.txt            # Dependencias Python
├── .env.example                # Variaveis de ambiente (template)
├── .env                        # Variaveis de ambiente (nao versionado)
├── Dockerfile                  # Imagem de producao
├── docker-compose.yml          # Orquestracao
├── templates/
│   └── index.html              # Interface web
├── static/
│   ├── style.css
│   └── script.js
├── database/
│   └── agenda.db               # SQLite (gerado automaticamente, nao versionado)
└── scripts/
    ├── run.py                  # Inicializador
    └── setup.py                # Instalador de dependencias
```

## Execucao

### Local

```bash
python scripts/run.py
```

Instale dependencias com:

```bash
python scripts/run.py install
```

### Docker

```bash
docker-compose down -v
docker-compose up --build -d
```

## Configuracao

Copie `.env.example` para `.env` e ajuste as variaveis:

```bash
FLASK_DEBUG=0
AGENDA_PORT=5000
SECRET_KEY=<chave-forte-aqui>
DATABASE_URL=sqlite:///database/agenda.db
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:3000
```

Gere uma chave segura com:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

## API

### Eventos

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/eventos/<data>` | Lista eventos do dia (YYYY-MM-DD) |
| POST | `/api/evento` | Cria evento |
| PUT | `/api/evento/<id>` | Atualiza evento |
| DELETE | `/api/evento/<id>` | Remove evento |

### Rotinas

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/rotinas` | Lista todas as rotinas |
| GET | `/api/rotinas/<data>` | Rotinas do dia |
| POST | `/api/rotina` | Cria rotina |
| PUT | `/api/rotina/<id>` | Atualiza rotina |
| DELETE | `/api/rotina/<id>` | Remove rotina |
| DELETE | `/api/rotinas` | Remove todas |
| POST | `/api/rotinas/batch` | Cria rotinas em lote |
| POST | `/api/rotina/<id>/gerar` | Gera eventos a partir de rotina |

### Utilidades

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/meses` | Estrutura de calendario 2026 |
| GET | `/health` | Health check |

### Exemplo

```bash
curl -X POST http://localhost:5000/api/evento \
  -H "Content-Type: application/json" \
  -d '{
    "data": "2026-06-07",
    "hora": "14:00",
    "titulo": "Reuniao",
    "descricao": "Sprint review",
    "duracao": 2,
    "cor": "#4285f4"
  }'
```

## Testes

```bash
pytest -v
```

## Qualidade

```bash
black .
flake8 .
pytest
```

## Docker

```bash
docker-compose logs -f
docker-compose down
```

Resetar banco:

```bash
docker-compose down -v
docker-compose up --build -d
```

## Producao

Recomenda-se usar PostgreSQL no lugar de SQLite, configurar `SECRET_KEY` forte, rodar atras de Nginx ou Cloudflare com HTTPS e configurar backup automatico do banco.

Exemplo com Gunicorn:

```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```

## Licenca

MIT
