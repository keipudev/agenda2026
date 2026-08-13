# 🚀 Guia Rápido - Agenda API 2026

## Setup Inicial

```bash
# Clone o repositório
git clone https://github.com/keipudev/agenda2026.git
cd agenda2026

# Crie o ambiente virtual
python -m venv .venv
.venv\Scripts\activate

# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
cp .env.example .env

# Inicie a aplicação
python app.py
```

Acesse: **http://localhost:5000**

## Comandos

| Comando | Descrição |
|---------|-----------|
| `python app.py` | Executa servidor Flask |
| `AGENDA_PORT=5001 python app.py` | Porta customizada |
| `pytest` | Executa testes |
| `black .` | Formata código |
| `flake8 .` | Lint |
| `docker-compose up -d` | Docker Linux |
| `docker-compose -f docker-compose.windows.yml up -d` | Docker Windows |

## Endpoints Principais

```bash
# Health check
curl http://localhost:5000/health

# Listar meses
curl http://localhost:5000/api/meses

# Eventos do dia
curl http://localhost:5000/api/eventos/2026-06-07

# Criar evento
curl -X POST http://localhost:5000/api/evento \
  -H "Content-Type: application/json" \
  -d '{"data":"2026-06-07","hora":"14:00","titulo":"Reunião"}'
```

## Troubleshooting

### Porta em uso
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Banco corrompido
Delete `database/agenda.db` e reinicie a aplicação.

### Dependências
```bash
pip install -r requirements.txt
```

**Última atualização**: 2026-08-12
**Versão**: 2.0
