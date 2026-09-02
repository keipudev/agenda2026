# Comandos para Agenda 2026

## Execucao

- `python scripts/run.py` - Iniciar aplicacao Flask (http://localhost:5000)
- `python scripts/run.py install` - Instalar dependencias
- `AGENDA_PORT=5001 python app.py` - Porta personalizada
- `FLASK_DEBUG=1 python app.py` - Modo debug
- `docker-compose up -d` - Docker

## Verificacao

- `python -m py_compile app.py` - Verificar sintaxe
- `pytest` - Executar testes
- `black .` - Formatar codigo
- `flake8 .` - Lint

## Dependencias

- `pip install -r requirements.txt` - Instalar dependencias
- `pip freeze > requirements.txt` - Atualizar lockfile

## Banco de dados

- Banco criado automaticamente em `database/agenda.db`
- Para resetar: delete `database/agenda.db` e reinicie a app

## Variaveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```bash
FLASK_DEBUG=0
AGENDA_PORT=5000
SECRET_KEY=change-me
DATABASE_URL=sqlite:///database/agenda.db
```
