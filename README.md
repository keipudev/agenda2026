# Agenda 2026

API REST em Flask para gerenciamento de agenda pessoal com suporte a eventos e rotinas, com interface web responsiva e modo escuro.

Este projeto está preparado para ser usado e mantido por outras pessoas. Siga as instruções abaixo para executar localmente ou via Docker.

## Stack

- Flask 2.3
- Flask-SQLAlchemy 3.1 (SQLite)
- Pydantic v2 (validação de dados)
- Flask-CORS
- Gunicorn (servidor de produção)
- Docker + Docker Compose
- HTML/CSS/JS (frontend)

## Estrutura

```
agenda2026/
├── app.py                      # Aplicacao Flask + Models + Rotas da API
├── test_app.py                 # Testes automatizados (unittest)
├── requirements.txt            # Dependencias Python (producao + dev)
├── .env.example                # Modelo de variaveis de ambiente
├── .env                        # Variaveis de ambiente (criar a partir do .env.example, nao versionado)
├── Dockerfile                  # Imagem de producao (multi-stage)
├── docker-compose.yml          # Orquestracao Docker
├── .github/workflows/ci.yml    # Integracao continua (testes + lint)
├── templates/
│   └── index.html              # Interface web
├── static/
│   ├── style.css               # Estilos (com modo escuro)
│   └── script.js               # Logica do frontend
├── database/
│   └── agenda.db               # SQLite (gerado automaticamente, nao versionado)
└── scripts/
    ├── run.py                  # Inicializador local
    └── setup.py                # Instalador de dependencias
```

## Instalacao rapida (local)

### 1. Instale o Python

Python 3.8+ e necessario. Recomendado Python 3.12.

### 2. Clone o repositorio

```bash
git clone https://github.com/keipudev/agenda2026.git
cd agenda2026
```

### 3. Configure as variaveis de ambiente

Copie o modelo e ajuste:

```bash
cp .env.example .env
```

Gere uma `SECRET_KEY` forte:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Cole o valor gerado no campo `SECRET_KEY` do arquivo `.env`.

### 4. Instale as dependencias

```bash
python scripts/run.py install
```

Ou manualmente:

```bash
pip install -r requirements.txt
```

### 5. Execute a aplicacao

```bash
python scripts/run.py
```

Acesse: http://localhost:5000

## Execucao com Docker

### Requisitos

- Docker Desktop instalado e em execucao
- Docker Compose

### Comandos

```bash
# Construir e iniciar o container
docker compose up --build -d

# Acessar a aplicacao
# http://localhost:5000

# Ver logs
docker compose logs -f

# Parar e remover (apaga o volume do banco)
docker compose down -v
```

O banco de dados e persistido no volume Docker `agenda2026-db`.

## Configuracao (.env)

Copie `.env.example` para `.env` e ajuste:

| Variavel | Descricao | Padrao |
|----------|-----------|--------|
| `FLASK_DEBUG` | Modo debug (0 ou 1) | `0` |
| `AGENDA_PORT` | Porta da aplicacao | `5000` |
| `SECRET_KEY` | Chave secreta para sessões/segurança | (obrigatório) |
| `DATABASE_URL` | URL do banco SQLite | `sqlite:///database/agenda.db` |
| `ALLOWED_ORIGINS` | Origens permitidas pelo CORS | `http://localhost:5000,http://localhost:3000` |

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
| GET | `/api/rotinas/<data>` | Rotinas ativas para um dia |
| POST | `/api/rotina` | Cria rotina |
| PUT | `/api/rotina/<id>` | Atualiza rotina |
| DELETE | `/api/rotina/<id>` | Remove rotina |
| DELETE | `/api/rotinas` | Remove todas as rotinas |
| POST | `/api/rotinas/batch` | Cria rotinas em lote |
| POST | `/api/rotina/<id>/gerar` | Gera eventos a partir de uma rotina |

### Utilidades

| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/api/meses` | Estrutura de calendario de 2026 |
| GET | `/health` | Health check |

Exemplo de criação de evento:

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

## Qualidade de codigo

```bash
# Formatacao
black .

# Lint
flake8 .

# Testes
pytest
```

O projeto contem um pipeline de Integracao Continua (`.github/workflows/ci.yml`) que roda `black --check`, `flake8` e `pytest` a cada push/PR.

## Producao

Recomendacoes para ambiente de producao:

- Use uma `SECRET_KEY` forte e nunca a commite no repositorio.
- Considere migrar de SQLite para PostgreSQL.
- Rode atras de um proxy reverso (Nginx, Caddy ou Cloudflare) com HTTPS.
- Defina `FLASK_DEBUG=0`.
- Configure backup automatico do banco de dados.
- Use Gunicorn em produção: `gunicorn --bind 0.0.0.0:5000 --workers 4 app:app`

## Contribuindo

1. Faça um fork do repositorio.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`.
3. Commit suas mudancas: `git commit -m "feat: descricao da feature"`.
4. Push para a branch: `git push origin minha-feature`.
5. Abra um Pull Request.

Antes de abrir o PR, rode `black .`, `flake8 .` e `pytest` para garantir que tudo esta funcionando.

## Licenca

MIT
