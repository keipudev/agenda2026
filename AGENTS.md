# Comandos para Agenda 2026

## Execução
- `python app.py` - Iniciar aplicação Flask (http://localhost:5000)
- `AGENDA_PORT=5001 python app.py` - Porta personalizada
- `FLASK_DEBUG=1 python app.py` - Modo debug
- `windows\executar_agenda_windows.bat` - Windows nativo (RECOMENDADO)
- `docker-compose up -d` - Docker Linux/WSL2
- `docker-compose -f docker-compose.windows.yml up -d` - Docker Windows

## Verificação
- `python -m py_compile app.py` - Verificar sintaxe
- `pytest` - Executar testes
- `black .` - Formatar código
- `flake8 .` - Lint

## Dependências
- `pip install -r requirements.txt` - Instalar dependências
- `pip freeze > requirements.txt` - Atualizar lockfile

## Banco de dados
- Banco criado automaticamente em `database/agenda.db`
- Para resetar: delete `database/agenda.db` e reinicie a app

## Variáveis de ambiente
Copie `.env.example` para `.env` e ajuste:
```bash
FLASK_DEBUG=0
AGENDA_PORT=5000
SECRET_KEY=change-me
DATABASE_URL=sqlite:///database/agenda.db
```
