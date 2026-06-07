# 🏗️ Arquitetura da Agenda Pessoal 2026

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NAVEGADOR (Frontend - v2.0)                    │
│  ┌────────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│  │   Google Calendar   │ │   Grade 0h-23h   │ │   Formulário     │  │
│  │   Inspired Design   │ │   Personalizada   │ │   Modern UI      │  │
│  │  (Full Calendar)    │ │  (CSS Grid)       │ │  (Glassmorphism) │  │
│  └────────────────────┘ └──────────────────┘ └──────────────────┘  │
│         ↓                    ↓                     ↓                 │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  JavaScript (script.js) - v2.0                                │ │
│  │  - Drag & drop                                                  │ │
│  │  - Auto-save                                                    │ │
│  │  - fullCalendar integration                                     │ │
│  │  - Notificações toast                                           │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON Requests (REST API)
                            │
               ┌────────────┼────────────┐
               │            │            │
        GET /api/    GET /api/    POST/PUT/DELETE
          meses     eventos/       /api/evento
                           │
┌──────────────────────────┼────────────────────────────┐
│        SERVIDOR BACKEND (Flask - app.py - v2.0)      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Rotas da API:                                       │
│  • GET  /               → Carrega página principal   │
│  • GET  /api/meses      → Estrutura dos 12 meses     │
│  • GET  /api/eventos    → Lista eventos (data/hora)  │
│  • POST /api/evento     → Cria novo evento           │
│  • PUT  /api/evento/:id → Atualiza evento            │
│  • DELETE /api/evento/:id → Deleta evento            │
│                                                      │
│  init_db()  → Cria tabela se não existir             │
│  get_db()   → Conecta ao SQLite                      │
│                                                      │
└──────────────────────┬───────────────────────────────┘
                       │
              SQLite Read/Write
                       │
         ┌──────────────┴──────────────┐
         │                             │
┌────────▼─────────────────────────────▼────────────┐
│      DATABASE (database/agenda.db - v2.0)          │
├────────────────────────────────────────────────────┤
│                                                    │
│  Table: eventos                                    │
│  ┌──────────────────────────────────────────┐     │
│  │ id        INTEGER PRIMARY KEY (auto)     │     │
│  │ data      TEXT (YYYY-MM-DD)              │     │
│  │ hora      TEXT (HH:MM)                   │     │
│  │ titulo    TEXT (obrigatório)             │     │
│  │ descricao TEXT (opcional)                │     │
│  │ duracao   INTEGER (1-4 horas)            │     │
│  │ cor       TEXT (#hex - padrão #3498db)    │     │
│  │ criado_em TIMESTAMP (auto)               │     │
│  └──────────────────────────────────────────┘     │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Fluxo de Dados

### 1️⃣ Carregar Página Principal
```
Usuário abre http://localhost:5000
          ↓
Flask retorna index.html (estilo Google Calendar)
          ↓
HTML carrega FullCalendar, style.css e script.js
          ↓
JavaScript executa inicializarAplicacao()
          ↓
Faz requisição GET /api/meses
          ↓
Backend retorna JSON com estrutura de 12 meses
          ↓
JavaScript renderiza FullCalendar + grade 0h-23h
          ↓
Página pronta com design moderno ✓
```

### 2️⃣ Visualizar Eventos no Calendário
```
Usuário abre http://localhost:5000
          ↓
FullCalendar carrega automaticamente
          ↓
GET /api/eventos (todos os eventos do ano)
          ↓
Backend retorna array de eventos
          ↓
JavaScript popula FullCalendar
          ↓
Eventos aparecem como barras coloridas no calendário ✓
```

### 3️⃣ Visualizar Dia (Grade de Horas 0h-23h)
```
Usuário clica em um dia no calendário
          ↓
JavaScript captura a data selecionada
          ↓
GET /api/eventos/2026-06-07
          ↓
Backend consulta SQL WHERE data = '2026-06-07'
          ↓
Retorna array JSON com eventos ordenados por hora
          ↓
JavaScript renderiza grade de 0h até 23h
          ↓
Para cada evento, cria um card na hora correspondente
          ↓
Usuário visualiza dia completo com horários personalizados ✓
```

### 4️⃣ Criar Novo Evento (Google Calendar Style)
```
Usuário clica em um horário no calendário ou na grade
          ↓
Modal abre com formulário moderno (glassmorphism)
          ↓
Usuário preenche: Título, Data/Hora, Descrição, Duração, Cor
          ↓
JavaScript valida dados
          ↓
POST /api/evento com JSON:
{
    "data": "2026-06-07",
    "hora": "14:00",
    "titulo": "Reunião com time",
    "descricao": "Sprint review",
    "duracao": 2,
    "cor": "#4285f4"
}
          ↓
Backend insere na tabela eventos do SQLite
          ↓
Retorna sucesso com ID do evento
          ↓
JavaScript recarrega eventos e atualiza interface
          ↓
Novo evento aparece como barra colorida no calendário ✓
```

### 5️⃣ Editar um Evento
```
Usuário clica em um evento na grade ou calendário
          ↓
Modal abre com dados do evento
          ↓
Usuário modifica campos
          ↓
Clica "Atualizar"
          ↓
PUT /api/evento/123 com JSON atualizado:
{
    "titulo": "Novo título",
    "descricao": "Nova descrição",
    "duracao": 3,
    "cor": "#e74c3c"
}
          ↓
Backend executa UPDATE no SQLite
          ↓
Retorna sucesso
          ↓
JavaScript recarrega e renderiza
          ↓
Evento atualizado na interface ✓
```

### 6️⃣ Deletar um Evento
```
Usuário clica em evento → modal abre
          ↓
Clica "Deletar"
          ↓
Sistema pede confirmação
          ↓
DELETE /api/evento/123
          ↓
Backend executa DELETE no SQLite WHERE id = 123
          ↓
Retorna sucesso
          ↓
JavaScript recarrega dados
          ↓
Evento desaparece da interface ✓
```

---

## Estrutura de Pastas

```
c:\agenda2026\
│
├── app.py                    ← Backend Flask (servidor)
├── requirements.txt          ← Dependências (Flask)
├── README.md                 ← Documentação completa
├── GUIA_RAPIDO.md           ← Este arquivo
├── ARQUITETURA.md           ← Este arquivo
│
├── templates/               ← Arquivos HTML
│   └── index.html          ← Página única (SPA)
│
├── static/                  ← Arquivos estáticos (Frontend)
│   ├── style.css           ← Estilos (CSS Grid, Flexbox)
│   └── script.js           ← Lógica (Vanilla JS, Fetch API)
│
└── database/               ← Banco de dados
    └── agenda.db          ← SQLite (criado automaticamente)
```

---

## Tecnologias e Por Quê

| Tecnologia | Por Quê |
|-----------|---------|
| **Flask** | Simples, eficiente, permite criar API REST facilmente |
| **SQLite** | Armazenamento local, sem servidor externo necessário |
| **HTML5** | Estrutura semântica e moderna |
| **CSS3** | Grid e Flexbox para layout responsivo |
| **JavaScript Vanilla** | Sem dependências, rápido, funciona em todos navegadores |
| **Fetch API** | Comunicação assíncrona com o servidor |

---

## Ciclo de Vida da Aplicação

```
1. INICIALIZAÇÃO
   ├── Flask cria servidor em localhost:5000
   ├── Banco de dados é criado automaticamente
   └── Aplicação pronta para receber conexões

2. CONEXÃO DO USUÁRIO
   ├── Usuário acessa http://localhost:5000
   ├── Flask carrega templates/index.html
   ├── Navegador baixa static/style.css e static/script.js
   └── JavaScript executa e a UI é renderizada

3. INTERAÇÃO
   ├── Usuário interage com a interface
   ├── JavaScript captura eventos (cliques, mudanças)
   ├── Frontend faz requisições HTTP para o backend
   ├── Backend processa e consulta/modifica o banco
   ├── Backend retorna JSON
   └── Frontend atualiza a interface

4. PERSISTÊNCIA
   ├── Todos os dados em database/agenda.db
   ├── Permanece entre fechamentos
   ├── Pode fazer backup copiando o arquivo .db
   └── Dados seguros e duráveis

5. ENCERRAMENTO
   ├── Usuário fecha navegador (nenhum problema)
   ├── Dados já foram salvos no banco
   ├── Administrador para a aplicação (CTRL+C)
   └── Banco fica preservado
```

---

## Segurança e Boas Práticas

### ✅ Implementado
- Validação de dados no frontend
- Banco de dados com tipo de dados corretos
- Timestamps de criação automáticos
- Operações CRUD seguras

### ⚠️ Notas para Produção (não implementado - é aplicação local)
- Adicionar autenticação de usuário
- Validação de dados no backend
- Rate limiting para API
- HTTPS em vez de HTTP
- Backup automático
- Logs de auditoria

---

## Fluxo Visual da Interface (v2.0 - Google Calendar Inspired)

```
┌───────────────────────────────────────────────────────────────┐
│  AGENDA PESSOAL 2026                     [Calendário][Dia]   │
├──────────────┬────────────────────────────────────────────────┤
│  ← Janeiro → │ 13 Dom  │                                   │
│  < 2026 >    │       │  00:00                               │
│  Dom Seg ... │       │  01:00                               │
│       1  2   │       │  02:00                               │
│   3  4  5  6 │       │  03:00                               │
│   7  8  9 10 │       │  04:00                               │
│  11 12 13 14 │       │  05:00                               │
│  15 16 17 18 │       │  06:00                               │
│  19 20 21 22 │       │  07:00  [Evento Trabalho]           │
│  23 24 25 26 │       │  08:00                               │
│  27 28 29 30 │       │  09:00                               │
│  31           │       │  10:00                               │
│               │       │  11:00                               │
│               │       │  ... até 23:00                       │
│               │       │                                      │
│  ● Hoje       │       │  Eventos coloridos em grade         │
│  ● Tem evts   │       │  Horários personalizáveis           │
│               │       │  Clique para adicionar               │
└──────────────┴───────┴──────────────────────────────────────┘

Design: Cores suaves, Glassmorphism, sombras modernas
Horários: 0h até 23h (meia-noite à meia-noite)
Clique no calendário: abre grade do dia selecionado
```

---

## Ciclo de Vida da Aplicação

```
1. INICIALIZAÇÃO
   ├── Flask cria servidor em localhost:5000
   ├── Banco de dados é criado automaticamente
   └── Aplicação pronta para receber conexões

2. CONEXÃO DO USUÁRIO
   ├── Usuário acessa http://localhost:5000
   ├── Flask carrega templates/index.html
   ├── Navegador baixa FullCalendar, style.css e script.js
   └── JavaScript executa e a UI é renderizada (estilo Google Calendar)

3. INTERAÇÃO
   ├── Usuário interage com o FullCalendar (clique, arraste)
   ├── JavaScript captura eventos (cliques, mudanças)
   ├── Frontend faz requisições HTTP para o backend
   ├── Backend processa e consulta/modifica o banco
   ├── Backend retorna JSON
   └── Frontend atualiza a interface

4. PERSISTÊNCIA
   ├── Todos os dados em database/agenda.db
   ├── Permanece entre fechamentos
   ├── Pode fazer backup copiando o arquivo .db
   └── Dados seguros e duráveis

5. ENCERRAMENTO
   ├── Usuário fecha navegador (nenhum problema)
   ├── Dados já foram salvos no banco
   ├── Administrador para a aplicação (CTRL+C)
   └── Banco fica preservado
```
┌─────────────────────────────────────────────┐
│  AGENDA PESSOAL 2026                        │
├──────────┬─────────────┬────────────────────┤
│ Calendário │ Dia │ Anotações                │
├─────────────────────────────────────────────┤
│                                             │
│  Abas com conteúdo tabulado:                │
│                                             │
│  [Calendário] - Visualizar mês inteiro      │
│  ├─ Navegação entre meses                   │
│  ├─ Dias com ponto = tem eventos            │
│  └─ Clique para selecionar data             │
│                                             │
│  [Dia] - Grade de horas do dia              │
│  ├─ Seletor de data                         │
│  ├─ Horas de 00:00 até 23:00                │
│  ├─ Eventos aparecem na hora                │
│  └─ Clique para editar                      │
│                                             │
│  [Anotações] - Criar e listar               │
│  ├─ Formulário (esquerda)                   │
│  └─ Lista de eventos (direita)              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Performance

- **Carregamento inicial**: ~1-2 segundos
- **Renderização**: Instantânea (JavaScript)
- **Operações no banco**: Praticamente instantâneas (<100ms)
- **Tamanho do banco**: Pequeno (~1KB por evento)
- **Memória**: Mínima (<50MB)

---

## Expansões Futuras

```
Aplicação Atual (v1.0)
        ↓
      ↙ ↘
  Frontend   Backend
    ├─      ├─ Google Calendar sync
    ├─      ├─ Notificações
    ├─      ├─ Backup automático
    ├─ PDF  ├─ Múltiplos usuários
    ├─ PWA  └─ Análise/relatórios
    └─ Mobile app
```

---

**Última atualização**: 2026-06-07
**Versão**: 1.0
