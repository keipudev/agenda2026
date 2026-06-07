# 🚀 Guia Rápido - Agenda Pessoal 2026 (v2.0)

## Início Rápido (2 minutos)

### Passo 1: Instalar Dependências
Abra o PowerShell na pasta `c:\agenda2026` e execute:

```powershell
pip install -r requirements.txt
```

### Passo 2: Iniciar a Aplicação
```powershell
python app.py
```

Você verá uma mensagem como:
```
 * Running on http://127.0.0.1:5000
```

### Passo 3: Abrir no Navegador
Acesse: **http://localhost:5000**

Pronto! Sua agenda está funcionando com estilo Google Calendar! 📅



## Interface Moderna (v2.0)
- **Design inspirado no Google Calendar**: Visual limpo, moderno e agradável
- **Grade de horários**: Ocupa **toda a janela** do dia (meia-noite à meia-noite)
- **Horários personalizáveis**: Noturnos conseguem começar às 0h e ir até as 23h
- **Calendário mensal**: Clique em qualquer dia para ver/modificar eventos
- **Seletor de horário**: Basta clicar em qualquer hora para abrir o formulário de novo evento

---

## Entendendo a Interface

### 📊 Aba "Calendário"
```
┌─────────────────────────────┐
│  CALENDÁRIO - Janeiro 2026  │
├─────────────────────────────┤
│ Dom  Seg  Ter  Qua  Qui  Sex│
│  1    2    3    4    5    6 │
│  7 ●  8    9   10   11   12 │  ← ● = tem eventos
│ 13   14   15   16   17   18 │
└─────────────────────────────┘
```

**O que fazer:**
- Clique nas setas para navegar entre meses
- Clique em um dia para selecioná-lo
- Um ponto vermelho (●) indica que o dia tem eventos

---

### ⏰ Aba "Dia" (Grade de Horas)
```
┌──────┬──────────────────────┐
│ 00:00│  [evento]            │
├──────┼──────────────────────┤
│ 01:00│                      │
├──────┼──────────────────────┤
│ 09:00│  [evento] [evento]   │
├──────┼──────────────────────┤
│      │       ...            │
└──────┴──────────────────────┘
```

**O que fazer:**
- Visualize os eventos de um dia específico
- Clique em qualquer evento para ver detalhes
- Use o seletor de data para trocar de dia
- Clique "+ Novo Evento" para criar

---

### 📝 Aba "Anotações"
```
┌─────────────────────┬──────────────────────┐
│  CRIAR EVENTO       │  EVENTOS DO DIA      │
├─────────────────────┼──────────────────────┤
│ Data: [07/01/2026] │ 14:00 - Reunião ●    │
│ Hora: [14:00   ▼]  │ 09:00 - Estudo ●     │
│ Título: [_____]    │ 15:00 - Treino ●     │
│ Descrição:         │                      │
│ [_______________]  │                      │
│                    │                      │
│ Duração: [1h ▼]    │                      │
│ Cor:     [███]     │                      │
│                    │                      │
│ [Salvar][Cancelar] │                      │
└─────────────────────┴──────────────────────┘
```

**O que fazer:**
- **Esquerda**: Formulário para criar/editar eventos
- **Direita**: Lista de eventos do dia selecionado
- Preencha os campos e clique "Salvar"

---

## Tarefas Comuns

### ✏️ Criar um Novo Evento

1. Vá para aba **"Anotações"**
2. Preencha os campos:
   - **Data**: Clique na data ou selecione no calendário
   - **Hora**: Escolha a hora (00:00 até 23:00)
   - **Título**: Ex: "Reunião com chefe"
   - **Descrição**: Detalhes (opcional)
   - **Duração**: 1 a 4 horas
   - **Cor**: Escolha uma cor
3. Clique **"Salvar"**

### 🔄 Editar um Evento

1. Clique no evento em qualquer lugar (calendário, grade ou lista)
2. Um popup aparecerá com os detalhes
3. Modifique o que quiser
4. Clique **"Atualizar"**

### ❌ Deletar um Evento

1. Clique no evento
2. No popup, clique **"Deletar"**
3. Confirme a exclusão

### 📅 Trocar de Dia

**Opção 1**: Clique em um dia no calendário (aba Calendário)

**Opção 2**: Use o seletor de data na aba Dia

**Opção 3**: Use as setas para navegar entre meses

---

## 💡 Dicas Profissionais

### 🎨 Sistema de Cores
Use cores consistentes para categorias:
- 🔵 **Azul** = Trabalho/Projetos
- 🟢 **Verde** = Pessoal/Família
- 🟡 **Amarelo** = Aprendizado/Estudo
- 🔴 **Vermelho** = Urgente/Importante
- 🟣 **Roxo** = Lazer/Hobby

### ⏱️ Grade de Horas
- Horário completo: 00:00 até 23:00 (meia-noite à meia-noite)
- Bem visível: até 4 horas de duração por evento
- Compacto: múltiplos eventos na mesma hora aparecem lado a lado

### 📌 Boas Práticas
- Títulos **curtos e específicos**
- Use a descrição para **detalhes importantes**
- **Planeje com antecedência** (semanas antes)
- **Revise frequentemente** antes de dormir ou ao acordar

---

## ⚠️ Problemas Comuns

### A aplicação não abre
1. Verifique se está rodando: `python app.py`
2. Tente: `http://localhost:5000`
3. Se a porta 5000 está em uso, veja a mensagem de erro
4. Use outra porta no `app.py`: `app.run(debug=True, port=5001)`

### Perdeu um evento
1. Verifique a data e hora corretas
2. Procure em outros dias
3. A data é salva automaticamente no banco de dados

### Interface lenta
1. Feche outras abas do navegador
2. Limpe o cache (Ctrl+Shift+Delete)
3. Reinicie a aplicação

### Banco de dados corrompido
1. Delete `database/agenda.db`
2. Reinicie a aplicação (`python app.py`)
3. Um novo banco será criado automaticamente

---

## 📊 Dados Salvos

Todos os dados ficam em: `c:\agenda2026\database\agenda.db`

Cada evento armazena:
```
ID          → Identificador único
Data        → YYYY-MM-DD
Hora        → HH:MM
Título      → Nome do evento
Descrição   → Anotações e detalhes
Duração     → 1 a 4 horas
Cor         → Código hexadecimal (ex: #3498db)
Criado em   → Data/hora de criação
```

---

## 🔧 Customizações Avançadas

### Trocar a Porta
No arquivo `app.py`, última linha:
```python
app.run(debug=True, port=5001)  # Mude 5000 para outra porta
```

### Trocar o Horário Inicial/Final
No arquivo `app.py`, busque por `for h in range(0, 24)` e altere 0 e 24.

### Mudar Cores do Design
Abra `static/style.css` e procure por `#667eea` (cor principal).

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se Python está instalado: `python --version`
2. Verifique se Flask está instalado: `pip list | grep Flask`
3. Veja o arquivo README.md para mais detalhes

---

**Última atualização**: 2026-06-07
**Versão**: 1.0 - Início Rápido
