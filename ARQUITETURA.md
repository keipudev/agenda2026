# 🏗️ Arquitetura da Agenda API 2026

## Stack Tecnológico

```
┌─────────────────────────────────────────┐
│            Frontend (Vanilla JS)         │
│   HTML5 + CSS3 + JavaScript (ES6+)      │
└─────────────────┬───────────────────────┘
                  │ HTTP/JSON
┌─────────────────▼───────────────────────┐
│            Flask 2.3 (Backend)          │
│  ┌───────────────────────────────────┐  │
│  │  Flask-SQLAlchemy 3.1 (ORM)       │  │
│  │  Flask-CORS (CORS support)        │  │
│  │  Pydantic v2 (Request validation) │  │
│  │  python-dotenv (Config)           │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│              SQLite Database             │
│          (database/agenda.db)            │
└──────────────────────────────────────────┘
```

## Camadas

```
Request
   │
   ▼
[Flask Route Handlers]
   │
   ▼
[Pydantic Validation] ──► 400 Bad Request
   │
   ▼
[Service Layer] (inline nas routes)
   │
   ▼
[SQLAlchemy ORM] ──► Models (Evento, Rotina)
   │
   ▼
[Database] ──► SQLite
```

## Modelos

### Evento

```python
class Evento(db.Model):
    id: int (PK)
    data: str (YYYY-MM-DD)
    hora: str (HH:MM)
    titulo: str
    descricao: text
    duracao: int (1-4h)
    cor: str (#hex)
    criado_em: datetime
```

### Rotina

```python
class Rotina(db.Model):
    id: int (PK)
    titulo: str
    descricao: text
    cor: str (#hex)
    dias_semana: json (array de int 0-6)
    hora_inicio: str (HH:MM)
    duracao: int
    data_inicio: str
    data_fim: str | null
    ativa: int (0/1)
    criado_em: datetime
```

## Fluxo de Request

```
Cliente HTTP
   │
   ▼
Flask Route (/api/evento)
   │
   ▼
Pydantic Schema Validation
   │
   ▼
SQLAlchemy Query / Transaction
   │
   ▼
JSON Response
```

## Tratamento de Erros

- `400` - Dados inválidos (Pydantic ValidationError)
- `404` - Recurso não encontrado
- `500` - Erro interno com rollback automático
- Logging estruturado para debugging

## Produção

- **Server**: Gunicorn com 4 workers + 2 threads
- **Container**: Docker multi-stage build
- **Healthcheck**: Endpoint `/health`
- **Config**: Variáveis de ambiente via `.env`

## Desenvolvimento

```bash
# Formatação
black app.py

# Lint
flake8 app.py

# Testes
pytest

# Type check (opcional)
mypy app.py
```

## Expansibilidade

- Trocado SQLite por PostgreSQL alterando `DATABASE_URL`
- Novas rotas seguem padrão REST
- Models SQLAlchemy permitem migrações futuras
- CORS configurado para integração com frontend separado

**Última atualização**: 2026-08-12
**Versão**: 2.0
